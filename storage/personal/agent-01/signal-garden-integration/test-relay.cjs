// Run: node --test test-relay.cjs. Exercises the same relay-core.js used in the browser.
const test = require('node:test');
const assert = require('node:assert/strict');
const {rails,select,meaning,enumerate} = require('./relay-core.js');
test('two unmodified source rails remain separate', () => {
  assert.deepEqual(rails(false,false), [['a','b'],['a','b'],['a','b']]);
  assert.deepEqual(select(['top','bottom','top'],false,false), ['a','b','a']);
});
test('mid crossover changes two downstream bands, not LOW', () => {
  assert.deepEqual(select(['top','top','top'],true,false), ['a','b','b']);
  assert.deepEqual(select(['top','top','top'],false,false), ['a','a','a']);
});
test('high crossover swaps only the final downstream band', () => {
  assert.deepEqual(select(['top','top','top'],false,true), ['a','a','b']);
  assert.deepEqual(select(['top','top','top'],true,true), ['a','b','a']);
});
test('all eight authored phrases reachable with traceable source identity', () => {
  const expected=['aaa','aab','aba','abb','baa','bab','bba','bbb'];
  assert.deepEqual(enumerate(),expected);
  for (const key of expected) {
    const result = meaning(key.split(''));
    assert.equal(result.key,key);
    assert.ok(result.time && result.action && result.reason);
  }
});
test('invalid tap and ambiguous fragment input is rejected', () => {
  assert.throws(()=>select(['top'],false,false),TypeError);
  assert.throws(()=>select(['top','none','top'],false,false),TypeError);
  assert.throws(()=>meaning(['a','x','b']),TypeError);
});
test('two successive switches are not two independent ending buttons', () => {
  const taps=['bottom','top','bottom'];
  const noCross=select(taps,false,false);
  const midCross=select(taps,true,false);
  assert.equal(noCross[0],midCross[0]);
  assert.notEqual(noCross[1],midCross[1]);
  assert.notEqual(noCross[2],midCross[2]);
});
