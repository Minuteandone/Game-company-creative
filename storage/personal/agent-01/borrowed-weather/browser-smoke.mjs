// End-to-end browser smoke test using Node 22 + a Chromium CDP websocket.
// Run: CHROME_PATH=/usr/bin/chromium node browser-smoke.mjs
// Uses an ephemeral debugger port, never a fixed shared machine port.
import http from 'node:http';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import {spawn} from 'node:child_process';
import {fileURLToPath} from 'node:url';

const ROOT=path.dirname(fileURLToPath(import.meta.url));
const chromePath=process.env.CHROME_PATH;
if(!chromePath)throw new Error('Set CHROME_PATH to a Chromium/Chrome executable');
if(typeof WebSocket==='undefined')throw new Error('Node 22+ with built-in WebSocket required');
const mime={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8'};
const server=http.createServer(async(req,res)=>{
  try{
    const pathname=new URL(req.url,'http://127.0.0.1').pathname;
    if(pathname==='/favicon.ico'){res.writeHead(204);res.end();return;}
    const relative=pathname==='/'?'index.html':decodeURIComponent(pathname.slice(1));
    const target=path.resolve(ROOT,relative);
    if(!target.startsWith(ROOT+path.sep)){res.writeHead(403);res.end();return;}
    const bytes=await fs.readFile(target);
    res.writeHead(200,{'content-type':mime[path.extname(target)]||'application/octet-stream'});
    res.end(bytes);
  }catch(e){res.writeHead(404);res.end('not found');}
});
let chrome=null,ws=null,profile=null,chromeStderr='',chromeExit=null;
let requests=0;
let nextId=1;
const pending=new Map();
const errors=[];
function check(value,message){if(!value)throw new Error(message);}
async function pause(ms){await new Promise(resolve=>setTimeout(resolve,ms));}
async function portFromProfile(profile){
  let lastError='';
  for(let attempt=0;attempt<120;attempt++){
    try{
      const raw=await fs.readFile(path.join(profile,'DevToolsActivePort'),'utf8');
      const value=Number(raw.split(/\r?\n/)[0]);
      if(Number.isInteger(value)&&value>0)return value;
    }catch(e){lastError=e.code||String(e);}
    if(chromeExit)throw new Error('Chrome exited before opening debugger: '+JSON.stringify(chromeExit)+' '+chromeStderr.slice(-2000));
    await pause(100);
  }
  throw new Error('DevToolsActivePort unavailable ('+lastError+'). Chrome stderr: '+chromeStderr.slice(-2000));
}
async function pageTarget(port,pageUrl){
  let last='';
  for(let attempt=0;attempt<80;attempt++){
    try{
      const response=await fetch('http://127.0.0.1:'+port+'/json/list');
      const list=await response.json();
      const target=list.find(x=>x.type==='page'&&x.url.startsWith(pageUrl.split('/index.html')[0]));
      if(target?.webSocketDebuggerUrl)return target;
      last='No matching page: '+JSON.stringify(list.map(x=>({type:x.type,url:x.url})));
    }catch(e){last=String(e);}
    if(chromeExit)break;
    await pause(100);
  }
  throw new Error('Chrome DevTools page target not found: '+last+'; stderr: '+chromeStderr.slice(-2000));
}
function send(method,params={}){
  const id=nextId++;
  return new Promise((resolve,reject)=>{
    pending.set(id,{resolve,reject});
    ws.send(JSON.stringify({id,method,params}));
  });
}
async function evalJS(expression){
  const response=await send('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true});
  if(response.exceptionDetails)throw new Error('Page evaluation failure: '+JSON.stringify(response.exceptionDetails));
  return response.result?.value;
}
async function waitJS(expression,label){
  for(let attempt=0;attempt<100;attempt++){
    if(await evalJS(expression))return;
    await pause(60);
  }
  throw new Error('Timed out waiting for '+label);
}
async function click(selector){
  const success=await evalJS('(()=>{const button=document.querySelector('+JSON.stringify(selector)+');'+
    'if(!button || button.disabled)return false;button.click();return true;})()');
  check(success,'Missing or disabled button '+selector);
}
async function stamp(weather){
  await click('[data-weather="'+weather+'"]');
  check(await evalJS('document.querySelectorAll(".result-card").length===1'),
    'Missing consequence result after '+weather);
  check(await evalJS('document.querySelectorAll("[data-weather]").length===0'),
    'Other weather stamps remain active after a choice');
  check(await evalJS('document.activeElement?.tagName==="H3"'),
    'Result heading did not receive keyboard focus after a stamp');
  await click('.result-card button');
  check(await evalJS('document.activeElement?.tagName==="H2"'),
    'Next scene heading did not receive focus after advancing');
}
try{
  await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
  const port=server.address().port;
  const pageUrl='http://127.0.0.1:'+port+'/index.html';
  profile=await fs.mkdtemp(path.join(os.tmpdir(),'borrowed-weather-'));
  chrome=spawn(chromePath,[
    '--headless=new','--no-sandbox','--disable-gpu','--disable-dev-shm-usage',
    '--remote-debugging-address=127.0.0.1','--remote-debugging-port=0',
    '--no-first-run','--no-default-browser-check',
    '--user-data-dir='+profile,pageUrl
  ],{stdio:['ignore','ignore','pipe']});
  chrome.stderr.on('data',x=>chromeStderr+=x.toString());
  chrome.on('exit',(code,signal)=>chromeExit={code,signal});
  const debuggerPort=await portFromProfile(profile);
  const target=await pageTarget(debuggerPort,pageUrl);
  ws=new WebSocket(target.webSocketDebuggerUrl);
  await new Promise((resolve,reject)=>{
    ws.addEventListener('open',resolve,{once:true});
    ws.addEventListener('error',reject,{once:true});
  });
  ws.addEventListener('message',event=>{
    const msg=JSON.parse(event.data);
    if(msg.id&&pending.has(msg.id)){
      const task=pending.get(msg.id);pending.delete(msg.id);
      if(msg.error)task.reject(new Error(JSON.stringify(msg.error)));else task.resolve(msg.result);
    }
    if(msg.method==='Runtime.exceptionThrown')errors.push(msg.params?.exceptionDetails?.text||'runtime exception');
    if(msg.method==='Log.entryAdded'&&msg.params?.entry?.level==='error')errors.push(msg.params.entry.text);
  });
  await send('Runtime.enable');await send('Log.enable');await send('Page.enable');
  await send('Emulation.setDeviceMetricsOverride',{width:375,height:812,deviceScaleFactor:1,mobile:true});
  await waitJS('document.readyState==="complete" && document.querySelectorAll("[data-weather]").length===3','first morning');
  check(await evalJS('document.documentElement.scrollWidth <= window.innerWidth'),'375px viewport overflow');

  for(const third of ['rain','sun','wind']){
    check(await evalJS('document.querySelectorAll("[data-weather]").length===3'),'first-morning stamps missing');
    await stamp('rain');
    check(await evalJS('document.querySelector(".callback-letter")?.textContent.includes("pear cutting")'),
      'Day 2 failed to show delayed garden callback');
    if(third==='rain'){
      await send('Page.navigate',{url:pageUrl});
      await waitJS('document.readyState==="complete" && document.querySelector(".callback-letter")?.textContent.includes("pear cutting")','reload persistence');
    }
    await stamp('wind');
    // Expanding the second day's log should recover both the early letter
    // caused by yesterday's rain and today's exact authored weather response.
    const journalReadable=await evalJS('(()=>{'+
      'const log=document.querySelectorAll(".log-detail")[1];'+
      'if(!log)return false;'+
      'log.querySelector("summary").click();'+
      'return log.open && log.textContent.includes("pear cutting") &&'+
      'log.textContent.includes("ferry carries recordings") &&'+
      'log.querySelector("blockquote.log-followup")!==null;})()');
    check(journalReadable,'Past forecast disclosure did not reveal its outcome and return letter');
    await stamp(third);
    const author={rain:'Jun',sun:'Mira',wind:'Ilen'}[third];
    check(await evalJS('document.querySelector(".letter-stack .from")?.textContent.includes('+JSON.stringify(author)+')'),
      'Day 4 continuity failed for third-day '+third);
    await stamp('sun');
    check(await evalJS('document.querySelector(".callback-letter")!==null'),'Day 5 missing festival callback');
    await stamp('wind');
    check(await evalJS('document.querySelector(".epilogue")!==null'),'Closing ledger missing');
    check(await evalJS('document.querySelectorAll("[data-weather]").length===0'),'Final ledger still has stamps');
    check(await evalJS('document.querySelector(".desk-panel")?.textContent.includes("Office closed")'),
      'Final ledger not marked closed');
    check(await evalJS('document.querySelectorAll(".log-detail").length===5 && document.querySelectorAll(".log-followup").length >= 1'),
      'Final ledger did not preserve all five forecast details and later correspondence');
    if(third==='wind'){
      await click('.desk-panel .text-button');
      check(await evalJS('document.querySelectorAll("[data-weather]").length===3'),'Final undo failed');
      await stamp('rain');
      check(await evalJS('document.querySelector(".epilogue")!==null'),'Undo/re-stamp ending failed');
    }
    await click('.epilogue button');
    check(await evalJS('document.querySelectorAll("[data-weather]").length===3'),'Replay failed to reset');
    check(await evalJS('document.documentElement.scrollWidth <= window.innerWidth'),
      '375px overflow after branch '+third);
    requests++;
  }
  check(errors.length===0,'Browser errors: '+errors.join('\n'));
  console.log('Borrowed Weather Chromium smoke passed:',{mobile:'375×812',branches:requests,reload:true,undo:true,callbacks:true});
}finally{
  try{ws?.close();}catch{}
  for(const task of pending.values())task.reject(new Error('CDP session closed'));
  if(chrome){
    if(chrome.exitCode===null && chrome.signalCode===null){
      chrome.kill('SIGTERM');
      for(let i=0;i<40 && chrome.exitCode===null && chrome.signalCode===null;i++)await pause(50);
      if(chrome.exitCode===null && chrome.signalCode===null){
        chrome.kill('SIGKILL');
        for(let i=0;i<20 && chrome.exitCode===null && chrome.signalCode===null;i++)await pause(50);
      }
    }
  }
  await new Promise(resolve=>server.close(resolve));
  // Chrome subprocesses can briefly keep writing profile files after the parent exits.
  if(profile)await fs.rm(profile,{recursive:true,force:true,maxRetries:20,retryDelay:100});
}
