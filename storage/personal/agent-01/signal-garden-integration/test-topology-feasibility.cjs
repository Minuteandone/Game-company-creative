const test=require('node:test');
const assert=require('node:assert/strict');
const {A,B,SINKS,PATTERNS,graph,validWitness,enumerate}=require('./topology-feasibility.cjs');
test('planar 4x4 reachability',()=>{
  assert.deepEqual(enumerate(-1).reachable,['AAA','AAB','ABB','BBB']);
});
test('one insulated crossover at 5 permits all eight optimistic patterns',()=>{
  const found=enumerate(5),g=graph(5);
  assert.deepEqual(found.reachable,PATTERNS);
  for(const p of PATTERNS)assert.equal(validWitness(p,found.witnesses[p],g),true,p);
});
test('crossover channels do not mix',()=>{
  const g=graph(5);
  assert.deepEqual(g[5].sort((a,b)=>a-b),[4,6]);
  assert.deepEqual(g[16].sort((a,b)=>a-b),[1,9]);
  assert.ok(!g[5].includes(16));
});
test('crossover placement matters',()=>{
  assert.deepEqual(enumerate(1).reachable,['AAA','AAB','ABB','BBB']);
});
test('invalid locations and claims are rejected',()=>{
  for(const i of [A,B,...SINKS])assert.throws(()=>graph(i),RangeError);
  assert.equal(validWitness('ABA',0,graph(5)),false);
});
