// Full browser-controller smoke tests against the actual integration HTML and relay core.
// No dependencies: node --test test-integration.cjs
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const html=fs.readFileSync(path.join(__dirname,'index.html'),'utf8');
const relay=fs.readFileSync(path.join(__dirname,'relay-core.js'),'utf8');
const inline=html.match(/<script>\s*([\s\S]*?)<\/script>/)?.[1];
if(!inline) throw new Error('Integration browser script not found');
function harness(){
  const nodes=new Map();
  function get(id,ds={}){
    if(!nodes.has(id)){
      const classes=new Set();
      nodes.set(id,{
        id,dataset:ds,innerHTML:'',textContent:'',disabled:false,className:'',attrs:{},
        style:{display:'',setProperty(key,value){this[key]=value}},
        classList:{add(x){classes.add(x)},remove(x){classes.delete(x)},toggle(x,on){if(on===undefined)on=!classes.has(x);if(on)classes.add(x);else classes.delete(x);return on},contains(x){return classes.has(x)}},
        listeners:{},setAttribute(key,value){this.attrs[key]=value},
        addEventListener(key,fn){this.listeners[key]=fn},
        querySelector(sel){return get(id+'::'+sel)},
        scrollIntoView(){},
        click(){if(!this.listeners.click)throw Error(id+' has no click listener');this.listeners.click()}
      });
    }
    return nodes.get(id);
  }
  const places=['harbor','garden','lock','tower'].map(place=>get('place-'+place,{place}));
  const taps=[0,1,2].map(i=>get('tap-'+i,{tap:String(i)}));
  const document={
    getElementById:id=>get(id),
    querySelectorAll:selector=>selector==='.place[data-place]'||selector==='.place'?places:selector==='[data-tap]'?taps:[],
    querySelector:selector=>{const m=selector.match(/^\[data-tap="(\d+)"\]$/);return m?taps[Number(m[1])]:null}
  };
  const context=vm.createContext({document,setTimeout(){}});
  vm.runInContext(relay,context,{filename:'relay-core.js'});
  vm.runInContext(inline,context,{filename:'index-inline.js'});
  return {get,places,taps,context};
}
function visitAll(h){
  h.places.slice(0,3).forEach(place=>place.click());
  assert.equal(h.get('visitCount').textContent,'3 / 3');
}
function finish(h){
  h.get('transmitButton').click();
  h.places.slice(0,3).forEach(place=>place.click());
  h.places[3].click();
  assert.equal(h.taps.every(t=>t.disabled),true, 'sent source taps must freeze');
  assert.equal(h.get('cross1').disabled,true, 'sent relays must freeze');
  assert.equal(h.get('ending').classList.contains('show'),true);
  assert.match(h.get('endingEcho').textContent,/TOWER 12/);
  assert.match(h.get('rootVial').textContent,/ROOT VIAL/);
}
test('exploration gates tower, topology constructs an ABA message, ending reveals root vial',()=>{
  const h=harness();
  assert.equal(h.get('towerButton').disabled,true);
  visitAll(h);
  assert.equal(h.get('towerButton').disabled,false);
  h.places[3].click();
  h.get('cross1').click();
  assert.match(h.get('transcript').innerHTML,/seal the north lock/);
  assert.match(h.get('transcript').innerHTML,/will drown/);
  h.get('cross2').click();
  assert.match(h.get('transcript').innerHTML,/garden can drink/);
  assert.match(h.get('railSummary').textContent,/Voice A \/ Voice B \/ Voice A/);
  finish(h);
  assert.match(h.get('endingTitle').textContent,/quiet watering/i);
});
test('all eight clean source assignments produce distinct reachable final echoes',()=>{
  const titles=new Set();
  for(let mask=0;mask<8;mask++){
    const h=harness();
    visitAll(h);h.places[3].click();
    for(let i=0;i<3;i++)if(mask&(1<<i))h.taps[i].click();
    assert.equal((h.get('transcript').innerHTML.match(/<span /g)||[]).length,3);
    finish(h);
    titles.add(h.get('endingTitle').textContent);
  }
  assert.equal(titles.size,8);
});
test('reset clears visit progress, messages, artifact and topology',()=>{
  const h=harness();visitAll(h);h.places[3].click();
  h.taps[0].click();h.get('cross1').click();
  finish(h);
  h.get('resetButton').click();
  assert.equal(h.get('towerButton').disabled,true);
  assert.equal(h.get('ending').classList.contains('show'),false);
  assert.equal(h.get('visitCount').textContent,'0 / 3');
  assert.match(h.get('railSummary').textContent,/Voice A \/ Voice A \/ Voice A/);
});
test('rail inputs expose source identities in their accessible names',()=>{
  const h=harness();visitAll(h);h.places[3].click();
  assert.match(h.taps[1].attrs['aria-label'],/ACTION tap.*Voice A/);
  h.get('cross1').click();
  assert.match(h.taps[1].attrs['aria-label'],/ACTION tap.*Voice B/);
  assert.equal(h.get('cross1').attrs['aria-pressed'],'true');
});

test('returning to island before broadcast retains relay position',()=>{
  const h=harness();visitAll(h);h.places[3].click();
  h.taps[2].click();
  assert.match(h.get('railSummary').textContent,/Voice A \/ Voice A \/ Voice B/);
  h.get('returnButton').click();
  h.places[3].click();
  assert.match(h.get('railSummary').textContent,/Voice A \/ Voice A \/ Voice B/);
  assert.equal(h.taps[2].disabled,false);
});
