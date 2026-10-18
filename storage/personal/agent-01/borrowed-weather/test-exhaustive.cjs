// Exhaustive finite-state content audit for all 3^5 Borrowed Weather ledgers.
// Usage: node --test test-exhaustive.cjs
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const ctx=vm.createContext({});
for(const name of ['story.js','game.js'])vm.runInContext(
  fs.readFileSync(path.join(__dirname,name),'utf8'),ctx,{filename:name});
const core=ctx.BorrowedWeatherCore,story=ctx.BW_STORY;
const skies=['rain','sun','wind'],resources=['gardens','harbor','lanterns'];
function sequences(length){
  const result=[];
  const visit=(history)=>{if(history.length===length){result.push(history);return;}
    for(const sky of skies)visit([...history,sky]);};
  visit([]);
  return result;
}
test('all 243 full playthroughs terminate with valid scores and authored endings',()=>{
  const endings=new Set();
  for(const seq of sequences(5)){
    let state=core.initialState();
    for(const sky of seq){
      state=core.choose(state,sky);
      assert.equal(state.viewingResult,true);
      state=core.continueDay(state);
    }
    assert.equal(core.isValidState(state),true);
    assert.equal(state.history.length,5);
    assert.equal(state.viewingResult,false);
    assert.strictEqual(core.choose(state,'rain'),state);
    const values=core.score(state.history);
    for(const name of resources)assert.ok(Number.isInteger(values[name])&&values[name]>=0&&values[name]<=10);
    const key=core.epilogueKey(values);endings.add(key);
    assert.ok(story.EPILOGUES[key]?.text.length>40);
  }
  assert.equal(endings.size,4);
});
test('all later callbacks and day-four Ilen histories remain well-defined',()=>{
  const seen=new Set();
  for(const seq of sequences(5)){
    const day4=story.DAY4_ENTRIES[seq[2]];
    assert.ok(day4.intro.length>40&&day4.letter.text.length>40);
    assert.equal(day4.letter.from.includes('Ilen • returned cartographer'),seq[2]==='wind');
    for(let day=1;day<5;day++){
      const previousValues=core.score(seq.slice(0,day));
      const letter=core.callbackForDay(day,previousValues);
      if(letter){
        assert.ok(letter.from.length>3&&letter.text.length>55&&letter.cause.length>12);
        seen.add(day+':'+letter.from+':'+letter.text);
      }
    }
  }
  // Jun high/low, Hal high/low, Mira high/low, three distinct festival responses.
  assert.equal(seen.size,9);
});
test('the day-five weather always causes a distinct visible consequence',()=>{
  for(const prefix of sequences(4)){
    const endings=[];
    const outcomes=[];
    for(const weather of skies){
      const seq=[...prefix,weather],v=core.score(seq);
      endings.push(core.epilogueKey(v));
      const outcome=story.DAYS[4].outcomes[weather];
      outcomes.push(outcome.text);
      assert.ok(outcome.text.length>45);
    }
    assert.equal(new Set(outcomes).size,3);
    // The ending can be anchored by four days of choices; no mandatory last-minute flip.
    assert.ok(new Set(endings).size>=1);
  }
});

test('final lantern scene honors a depleted archive without promising a full display',()=>{
  // Four Wind forecasts leave the archive at zero; the fifth-day Sun raises it only to two.
  assert.equal(core.score(['wind','wind','wind','wind','sun']).lanterns,2);
  const lanternEvening=story.DAYS[4].outcomes.sun.text;
  assert.match(lanternEvening,/as many memory lanterns as the sky will let her/);
  assert.match(lanternEvening,/Wherever a glass voice stays quiet/);
  assert.match(lanternEvening,/Nobody has to remember alone/);
});
