// Dependency-free smoke tests for the actual Borrowed Weather browser renderer.
// Usage: node --test test-render.cjs
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const story=fs.readFileSync(path.join(__dirname,'story.js'),'utf8');
const game=fs.readFileSync(path.join(__dirname,'game.js'),'utf8');
function browser(previousStorage){
  const memory=previousStorage || new Map();
  function node(tag){
    return {
      tagName:tag,className:'',textContent:'',dataset:{},attributes:{},style:{},children:[],listeners:{},
      appendChild(child){this.children.push(child);return child},
      replaceChildren(...items){this.children=[...items]},
      addEventListener(event,fn){this.listeners[event]=fn},
      setAttribute(key,value){this.attributes[key]=value},
      querySelector(selector){
        let current=this;
        for(const part of selector.trim().split(' ')){
          const matches=[];
          (function visit(n){
            for(const child of n.children){
              if(part.startsWith('.')?child.className.split(' ').includes(part.slice(1)):child.tagName===part)matches.push(child);
              visit(child);
            }
          })(current);
          current=matches[0];
          if(!current)return null;
        }
        return current;
      },
      focus(){document.activeElement=this},
      click(){assert.ok(this.listeners.click,'missing click event on '+this.tagName);this.listeners.click()}
    };
  }
  const ids=Object.fromEntries(['game-root','day-ticket','announcer','reset-button'].map(id=>[id,node('div')]));
  const document={getElementById:id=>ids[id],createElement:node};
  const storage={getItem:key=>memory.get(key)||null,setItem:(key,value)=>memory.set(key,value)};
  const context=vm.createContext({document,localStorage:storage,confirm:()=>true});
  vm.runInContext(story,context,{filename:'story.js'});
  vm.runInContext(game,context,{filename:'game.js'});
  const find=(predicate,parent=ids['game-root'])=>{
    const result=[];
    (function visit(n){if(predicate(n))result.push(n);n.children.forEach(visit)})(parent);
    return result;
  };
  const cls=c=>find(n=>n.className.split(' ').includes(c));
  const stamp=w=>cls('stamp').find(n=>n.dataset.weather===w);
  const next=()=>cls('primary-button').find(n=>/Open the next morning|Read the closing ledger/.test(n.textContent));
  return {ids,memory,document,find,cls,stamp,next,core:context.BorrowedWeatherCore};
}
function pick(b,w){const btn=b.stamp(w);assert.ok(btn,'weather stamp '+w+' missing');btn.click();assert.ok(b.cls('result-card').length);const n=b.next();assert.ok(n);n.click();}
test('five-day renderer has no inert sixth stamp after ending',()=>{
  const b=browser();
  for(const w of ['rain','wind','sun','rain','wind'])pick(b,w);
  assert.equal(b.ids['day-ticket'].textContent,'LEDGER COMPLETE');
  assert.equal(b.stamp('rain'),undefined);
  assert.equal(b.stamp('sun'),undefined);
  assert.equal(b.stamp('wind'),undefined);
  assert.equal(b.cls('epilogue').length,1);
  assert.equal(b.cls('log-item').length,5);
});
test('Day 4 incoming letter reflects whether the Day 3 ferry returned Ilen',()=>{
  for(const [sky,person] of [['rain','Jun'],['sun','Mira'],['wind','Ilen']]){
    const b=browser();
    for(const w of ['rain','sun',sky])pick(b,w);
    const from=b.cls('from').map(n=>n.textContent).join(' | ');
    assert.match(from,new RegExp(person));
    if(sky!=='wind')assert.doesNotMatch(from,/Ilen • returned cartographer/);
    else assert.match(from,/Ilen • returned cartographer/);
  }
});
test('undo from finished ledger restores stamps and next choice',()=>{
  const b=browser();
  for(const w of ['wind','wind','wind','wind','wind'])pick(b,w);
  assert.equal(b.stamp('rain'),undefined);
  const undo=b.cls('text-button').find(n=>/Undo the last stamp/.test(n.textContent));
  assert.ok(undo);undo.click();
  assert.ok(b.stamp('rain'));
  assert.equal(b.cls('epilogue').length,0);
  pick(b,'sun');
  assert.equal(b.cls('epilogue').length,1);
});
test('save/reload preserves both current day and result-screen phase',()=>{
  let b=browser();
  b.stamp('rain').click();
  let restored=browser(b.memory);
  assert.ok(restored.cls('result-card').length);
  restored.next().click();
  const dayTwo=browser(b.memory);
  assert.match(dayTwo.ids['day-ticket'].textContent,/DAY 02/);
  assert.ok(dayTwo.stamp('wind'));
});

test('focus follows rewritten result, new morning, and final ledger',()=>{
  const b=browser();
  b.stamp('rain').click();
  assert.equal(b.document.activeElement.tagName,'h3');
  assert.equal(b.document.activeElement.textContent,'Names written in water');
  b.next().click();
  assert.equal(b.document.activeElement.tagName,'h2');
  assert.equal(b.document.activeElement.textContent,'A place to keep yesterday');
  for(const w of ['sun','rain','wind','sun'])pick(b,w);
  assert.equal(b.ids['day-ticket'].textContent,'LEDGER COMPLETE');
  assert.equal(b.document.activeElement.tagName,'h2');
  assert.equal(b.document.activeElement.textContent,b.cls('epilogue')[0].querySelector('h2').textContent);
});


test('ledger discloses exact authored consequences for prior weather choices',()=>{
  const b=browser();
  for(const sky of ['rain','sun','wind'])pick(b,sky);
  const history=b.cls('log-detail');
  assert.equal(history.length,3);
  const passages=b.cls('log-consequence').map(n=>n.textContent);
  assert.match(passages[0],/saplings sound like applause/);
  assert.match(passages[1],/walls bloom with voices/);
  assert.match(passages[2],/ferry arrives with a cartographer named Ilen/);
  assert.equal(b.find(n=>n.tagName==='summary').length,3);
});
test('undo and restored save rebuild journal without stale consequences',()=>{
  const b=browser();
  for(const sky of ['rain','sun'])pick(b,sky);
  const restored=browser(b.memory);
  assert.equal(restored.cls('log-detail').length,2);
  const undo=restored.cls('text-button').find(n=>/Undo the last stamp/.test(n.textContent));
  undo.click();
  assert.equal(restored.cls('log-detail').length,1);
  restored.stamp('wind').click();
  const passages=restored.cls('log-consequence').map(n=>n.textContent);
  assert.match(passages[0],/saplings sound like applause/);
  assert.doesNotMatch(passages[1],/walls bloom with voices/);
  assert.match(passages[1],/ferry carries recordings from the outer docks/);
});
