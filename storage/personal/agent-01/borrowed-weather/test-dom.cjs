// Offline DOM interaction tests: real story.js + game.js, native Node test runner.
const test=require('node:test'), assert=require('node:assert/strict'), fs=require('node:fs'), path=require('node:path'), vm=require('node:vm');
class Element {
  constructor(tag){this.tagName=tag.toUpperCase();this.children=[];this.attributes={};this.style={};this.dataset={};this.className='';this.disabled=false;this.listeners={};this._text='';}
  set textContent(value){this._text=String(value);this.children=[];}
  get textContent(){return this._text+this.children.map(x=>x.textContent).join('');}
  appendChild(x){this.children.push(x);x.parentNode=this;return x;}
  replaceChildren(...xs){this._text='';this.children=[];for(const x of xs)this.appendChild(x);}
  setAttribute(k,v){this.attributes[k]=String(v);}
  getAttribute(k){return this.attributes[k]??null;}
  addEventListener(event,fn){(this.listeners[event]??=[]).push(fn);}
  click(){if(!this.disabled)for(const fn of this.listeners.click??[])fn();}
  focus(){if(this.ownerDocument)this.ownerDocument.activeElement=this;}
  querySelector(selector){
    const parts=selector.trim().split(/\s+/);
    const matches=(n,p)=>p[0]==='.'?n.className.split(/\s+/).includes(p.slice(1)):n.tagName===p.toUpperCase();
    const found=[];
    function traverse(n){for(const child of n.children){found.push(child);traverse(child);}}
    traverse(this);
    if(parts.length===1)return found.find(n=>matches(n,parts[0]))??null;
    if(parts.length===2)return found.find(n=>{
      if(!matches(n,parts[1]))return false;
      for(let parent=n.parentNode;parent;parent=parent.parentNode)
        if(matches(parent,parts[0]))return true;
      return false;
    })??null;
    throw new Error('Unsupported test selector: '+selector);
  }
}
function mount(storageMap=new Map()){
  const ids={};for(const id of ['game-root','day-ticket','announcer','reset-button'])ids[id]=new Element('div');
  ids['reset-button'].tagName='BUTTON';
  const document={activeElement:null,getElementById:id=>ids[id]??null,
    createElement:tag=>{const node=new Element(tag);node.ownerDocument=document;return node;}};
  for(const element of Object.values(ids))element.ownerDocument=document;
  const localStorage={getItem:k=>storageMap.get(k)??null,setItem:(k,v)=>storageMap.set(k,v)};
  const context=vm.createContext({document,localStorage,confirm:()=>true});
  for(const file of ['story.js','game.js'])vm.runInContext(fs.readFileSync(path.join(__dirname,file),'utf8'),context,{filename:file});
  function all(pred){
    const found=[];
    function visit(n){if(pred(n))found.push(n);for(const child of n.children)visit(child);}
    visit(ids['game-root']);return found;
  }
  const byClass=css=>all(n=>n.className.split(/\s+/).includes(css));
  const stamp=weather=>all(n=>n.tagName==='BUTTON'&&n.dataset.weather===weather)[0];
  const button=label=>all(n=>n.tagName==='BUTTON'&&n.textContent.includes(label))[0];
  function next(){const b=button('Open the next morning')||button('Read the closing ledger');assert.ok(b,'result advance button');b.click();}
  function play(weather){const b=stamp(weather);assert.ok(b,weather+' stamp visible');b.click();next();}
  return {ids,document,byClass,stamp,button,next,play};
}
test('stamp -> result -> later correspondence',()=>{
  const ui=mount();assert.equal(ui.byClass('stamp').length,3);
  ui.stamp('rain').click();assert.equal(ui.byClass('stamp').length,0);
  assert.equal(ui.byClass('result-card').length,1);ui.next();
  assert.equal(ui.byClass('callback-letter').length,1);
  assert.match(ui.byClass('callback-letter')[0].textContent,/pear cutting/);
  assert.match(ui.ids['day-ticket'].textContent,/DAY 02/);
});
test('final ledger has no inert stamp buttons, undo restores last decision',()=>{
  const ui=mount();for(const w of ['rain','rain','sun','sun','wind'])ui.play(w);
  assert.equal(ui.byClass('epilogue').length,1);assert.equal(ui.byClass('stamp').length,0);
  assert.match(ui.ids['game-root'].textContent,/Office closed/);
  assert.match(ui.ids['day-ticket'].textContent,/LEDGER COMPLETE/);
  ui.button('Undo the last stamp').click();
  assert.equal(ui.byClass('stamp').length,3);assert.equal(ui.byClass('epilogue').length,0);
  assert.match(ui.ids['day-ticket'].textContent,/DAY 05/);
});
test('day-four correspondent follows day-three crossing',()=>{
  for(const [weather,re] of Object.entries({rain:/Jun/,sun:/Mira/,wind:/Ilen/})){
    const ui=mount();ui.play('wind');ui.play('wind');ui.play(weather);
    const first=ui.byClass('letter-stack')[0].children[0].textContent;
    assert.match(first,re);
    if(weather!=='wind')assert.doesNotMatch(first,/returned cartographer/);
  }
});
test('reload preserves delayed consequence; undo recalculates it',()=>{
  const shared=new Map(),a=mount(shared);a.play('sun');
  assert.match(a.byClass('callback-letter')[0].textContent,/seed trays/);
  const b=mount(shared);
  assert.equal(b.byClass('callback-letter').length,1);
  b.button('Undo the last stamp').click();
  assert.equal(b.byClass('callback-letter').length,0);
  b.play('rain');
  assert.match(b.byClass('callback-letter')[0].textContent,/pear cutting/);
});
test('replay clears local save and begins clean',()=>{
  const shared=new Map(),ui=mount(shared);
  for(const w of ['wind','wind','wind','wind','wind'])ui.play(w);
  ui.button('Begin another five days').click();
  assert.equal(ui.byClass('stamp').length,3);
  assert.match(ui.ids['day-ticket'].textContent,/DAY 01/);
  assert.equal(mount(shared).byClass('callback-letter').length,0);
});

test('keyboard focus moves into each new scene when buttons are replaced',()=>{
  const ui=mount();
  ui.stamp('rain').click();
  const resultHeading=ui.ids['game-root'].querySelector('.result-card h3');
  assert.ok(resultHeading);
  assert.equal(ui.document.activeElement,resultHeading,'stamp should focus result heading');
  assert.equal(resultHeading.getAttribute('tabindex'),'-1');
  ui.next();
  const dayHeading=ui.ids['game-root'].querySelector('.story-panel h2');
  assert.equal(ui.document.activeElement,dayHeading,'advance should focus new morning heading');
  ui.button('Undo the last stamp').click();
  assert.equal(ui.document.activeElement,ui.ids['game-root'].querySelector('.story-panel h2'));
  ui.stamp('wind').click();
  ui.next();
  for(let i=0;i<4;i++)ui.play(i%2?'sun':'wind');
  const finalHeading=ui.ids['game-root'].querySelector('.epilogue h2');
  assert.equal(ui.document.activeElement,finalHeading,'closing ledger should focus epilogue heading');
  ui.button('Begin another five days').click();
  assert.equal(ui.document.activeElement,ui.ids['game-root'].querySelector('.story-panel h2'),'replay should focus new opening');
});
