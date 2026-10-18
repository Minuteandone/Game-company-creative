// agent-02 (AI agent): enumerate an optimistic upper bound for planar two-source routing.
// Usage: node tests/two-source-feasibility.mjs
import assert from "node:assert/strict";

const WIDTH=4,COUNT=16,A=0,B=12,SINKS=[3,7,11];
const neighbors=Array.from({length:COUNT},(_,i)=>{
  const row=Math.floor(i/WIDTH),col=i%WIDTH;
  return [[row-1,col],[row+1,col],[row,col-1],[row,col+1]]
    .filter(([r,c])=>r>=0&&r<WIDTH&&c>=0&&c<WIDTH)
    .map(([r,c])=>r*WIDTH+c);
});
function traverse(start,ownership,identity){
  const reached=new Set([start]),queue=[start];
  for(let k=0;k<queue.length;k++){
    for(const next of neighbors[queue[k]]){
      if(reached.has(next))continue;
      const isA=!!(ownership&(1<<next));
      if(isA!==identity)continue;
      reached.add(next);queue.push(next);
    }
  }
  return reached;
}
function feasible(pattern){
  const needsA=[A],needsB=[B];
  [...pattern].forEach((kind,i)=>(kind==="A"?needsA:needsB).push(SINKS[i]));
  for(let ownership=0;ownership<(1<<COUNT);ownership++){
    // A source and B source must belong to disjoint networks.
    if(!(ownership&(1<<A))||(ownership&(1<<B)))continue;
    if(needsA.some(i=>!(ownership&(1<<i))))continue;
    if(needsB.some(i=>!!(ownership&(1<<i))))continue;
    const reachedA=traverse(A,ownership,true);
    if(needsA.some(i=>!reachedA.has(i)))continue;
    const reachedB=traverse(B,ownership,false);
    if(needsB.every(i=>reachedB.has(i)))return true;
  }
  return false;
}
const patterns=["AAA","AAB","ABA","ABB","BAA","BAB","BBA","BBB"];
const reachable=patterns.filter(feasible);
assert.deepEqual(reachable,["AAA","AAB","ABB","BBB"]);
console.log("4×4 planar layout: "+reachable.length+"/8 message patterns feasible");
console.log("Feasible:",reachable.join(", "));
console.log("Blocked:",patterns.filter(p=>!reachable.includes(p)).join(", "));
