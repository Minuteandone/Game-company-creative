// Optimistic two-source topology feasibility for a 4×4 network.
// Credits: agent-02's planar upper-bound finding and enumeration method.
// Extension by agent-01: one independent horizontal/vertical crossover channel.
"use strict";
const SIDE=4, CELLS=16, A=0, B=12, SINKS=Object.freeze([3,7,11]);
const PATTERNS=Object.freeze(["AAA","AAB","ABA","ABB","BAA","BAB","BBA","BBB"]);
function graph(crossover=-1){
  if(!Number.isInteger(crossover)||crossover>=CELLS||crossover<-1||
    [A,B,...SINKS].includes(crossover)) throw new RangeError("Invalid internal crossover cell");
  const adj=Array.from({length:crossover===-1?16:17},()=>[]);
  for(let i=0;i<CELLS;i++){
    const row=Math.floor(i/SIDE),col=i%SIDE;
    for(const [rr,cc,vertical] of [[row+1,col,true],[row,col+1,false]]){
      if(rr>=SIDE||cc>=SIDE)continue;
      const j=rr*SIDE+cc;
      // Cross tile contains two separate nodes: original index is horizontal; 16 is vertical.
      const u=i===crossover?(vertical?16:i):i;
      const v=j===crossover?(vertical?16:j):j;
      adj[u].push(v);adj[v].push(u);
    }
  }
  return adj;
}
function reach(adj,start,mask,ownerA){
  let seen=1<<start;
  const queue=[start];
  for(let k=0;k<queue.length;k++){
    for(const next of adj[queue[k]]){
      const flag=1<<next;
      if((seen&flag)||(Boolean(mask&flag)!==ownerA))continue;
      seen|=flag;queue.push(next);
    }
  }
  return seen;
}
function validWitness(key,mask,adj){
  if(!PATTERNS.includes(key)||!Number.isInteger(mask))return false;
  if(!(mask&(1<<A))||(mask&(1<<B)))return false;
  let requiredA=1<<A,requiredB=1<<B;
  for(let i=0;i<3;i++){
    const flag=1<<SINKS[i],ownedByA=Boolean(mask&flag);
    if(ownedByA!==(key[i]==="A"))return false;
    if(ownedByA)requiredA|=flag;else requiredB|=flag;
  }
  return (reach(adj,A,mask,true)&requiredA)===requiredA &&
    (reach(adj,B,mask,false)&requiredB)===requiredB;
}
function enumerate(crossover=-1){
  const adj=graph(crossover),limit=1<<adj.length;
  const witnesses=Object.create(null);
  for(let mask=1;mask<limit;mask+=2){
    if(mask&(1<<B))continue;
    const key=SINKS.map(index=>mask&(1<<index)?"A":"B").join("");
    if(Object.prototype.hasOwnProperty.call(witnesses,key))continue;
    if(validWitness(key,mask,adj)){
      witnesses[key]=mask;
      if(Object.keys(witnesses).length===PATTERNS.length)break;
    }
  }
  return {crossover, reachable:PATTERNS.filter(p=>p in witnesses),witnesses};
}
module.exports={SIDE,CELLS,A,B,SINKS,PATTERNS,graph,reach,validWitness,enumerate};
