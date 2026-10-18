/**
 * Author: agent-02 (AI agent).
 * Constructive feasibility checker for the Glass Kelp candidate port layout.
 *
 * IMPORTANT: each witness uses a potentially DIFFERENT ordinary-tile inventory.
 * Thus 8 geometry witnesses do not prove that one fixed set of rotatable tiles
 * supports 8 messages. This is a necessary, not sufficient, design milestone.
 */
import { neighbor, traceNetwork } from "./routing.mjs";

export const GLASS_KELP_TERMINALS = Object.freeze({
  width: 4,
  height: 4,
  sources: [{id:"A",cell:0,port:3}, {id:"B",cell:12,port:3}],
  sinks: [{id:"when",cell:3,port:1},{id:"action",cell:7,port:1},{id:"why",cell:11,port:1}]
});
export const ALL_MESSAGES = Object.freeze(["AAA","AAB","ABA","ABB","BAA","BAB","BBA","BBB"]);

// Each crossover cell creates a *horizontal* and a *vertical* graph node.
// Normal tiles are single graph nodes, independent of their eventual pipe shape.
function optimisticGraph(template, crossCells) {
  const width=template.width,height=template.height,count=width*height;
  const crossSet=new Set(crossCells);
  if (crossSet.size !== crossCells.length ||
      crossCells.some(c=>!Number.isInteger(c)||c<0||c>=count))
    throw new TypeError("Invalid crossover positions");
  const nodes=[],channels=[];
  for(let cell=0;cell<count;cell++) {
    const mapping={};
    if(crossSet.has(cell)){
      mapping.H=nodes.length;nodes.push({cell,channel:"H"});
      mapping.V=nodes.length;nodes.push({cell,channel:"V"});
    }else{
      mapping.C=nodes.length;nodes.push({cell,channel:"C"});
    }
    channels.push(mapping);
  }
  if(nodes.length>25)throw new RangeError("Optimistic enumeration limited to 25 graph channels");
  const nodeAt=(cell,port)=>channels[cell].C??channels[cell][port%2?"H":"V"];
  const adjacency=nodes.map(()=>0);
  const edges=[];
  for(let cell=0;cell<count;cell++){
    for(const direction of [1,2]){
      const other=neighbor(cell,direction,width,height);
      if(other===-1)continue;
      const a=nodeAt(cell,direction),b=nodeAt(other,(direction+2)%4);
      adjacency[a]|=1<<b; adjacency[b]|=1<<a;
      edges.push([a,b]);
    }
  }
  return {
    nodes,channels,adjacency,edges,nodeAt,
    start:template.sources.map(t=>nodeAt(t.cell,t.port)),
    ends:template.sinks.map(t=>nodeAt(t.cell,t.port))
  };
}

function reachable(graph,start,mask) {
  let reached=1<<start,frontier=reached;
  while(frontier){
    let neighborsMask=0;
    for(let bits=frontier;bits;bits&=bits-1){
      const one=bits&-bits;
      neighborsMask|=graph.adjacency[31-Math.clz32(one)];
    }
    frontier=neighborsMask&mask&~reached;
    reached|=frontier;
  }
  return reached;
}
function patternAssignment(graph,pattern) {
  const a=[graph.start[0]],b=[graph.start[1]];
  [...pattern].forEach((id,i)=>(id==="A"?a:b).push(graph.ends[i]));
  const toMask=list=>list.reduce((out,x)=>out|(1<<x),0);
  const requiredA=toMask(a),requiredB=toMask(b),all=(1<<graph.nodes.length)-1;
  if(requiredA&requiredB)return null;
  for(let mask=0;mask<=all;mask++){
    if((mask&requiredA)!==requiredA||(mask&requiredB)!==0)continue;
    if((reachable(graph,graph.start[0],mask)&requiredA)!==requiredA)continue;
    if((reachable(graph,graph.start[1],all^mask)&requiredB)!==requiredB)continue;
    return {mask,targetsA:a,targetsB:b};
  }
  return null;
}

// Compute shortest root-to-terminal paths in the chosen source-owned area.
// The union is a connected source tree (with possible shared segments).
function treeEdges(graph,start,targets,mask){
  const parents=Array(graph.nodes.length).fill(-1),queue=[start],seen=new Set(queue);
  for(let k=0;k<queue.length;k++){
    const at=queue[k];
    for(let j=0;j<graph.nodes.length;j++){
      if(!(graph.adjacency[at]&(1<<j))||!(mask&(1<<j))||seen.has(j))continue;
      parents[j]=at;seen.add(j);queue.push(j);
    }
  }
  const keys=new Set();
  for(const target of targets){
    if(!seen.has(target))throw new Error("Feasibility assignment was disconnected");
    for(let at=target;at!==start;at=parents[at]){
      const parent=parents[at];
      keys.add([Math.min(at,parent),Math.max(at,parent)].join(":"));
    }
  }
  return [...keys].map(str=>str.split(":").map(Number));
}
function edgeDirection(a,b,width){
  if(b===a-width)return 0;
  if(b===a+1&&Math.floor(a/width)===Math.floor(b/width))return 1;
  if(b===a+width)return 2;
  if(b===a-1&&Math.floor(a/width)===Math.floor(b/width))return 3;
  throw new Error("Edge is not cardinally adjacent");
}

/**
 * @param {string} pattern like "ABA"
 * @param {number[]} crossCells cells with insulated vertical/horizontal paths
 * @param {object} template fixed terminal layout; default Glass Kelp test
 * @returns {object|null} e.g. {layout, pattern, crossoverCells}
 *
 * A successful returned layout is CONSTRUCTIVELY valid: independently passed
 * through the real port-reciprocity and provenance engine.
 */
export function makeRoutingWitness(pattern, crossCells=[5], template=GLASS_KELP_TERMINALS) {
  if(!ALL_MESSAGES.includes(pattern))throw new TypeError("Pattern must be three A/B letters");
  const graph=optimisticGraph(template,crossCells),assignment=patternAssignment(graph,pattern);
  if(!assignment)return null;
  const count=template.width*template.height;
  const tilePortSets=Array.from({length:count},()=>new Set());
  const all=(1<<graph.nodes.length)-1;
  const edges=[
    ...treeEdges(graph,graph.start[0],assignment.targetsA,assignment.mask),
    ...treeEdges(graph,graph.start[1],assignment.targetsB,all^assignment.mask)
  ];
  for(const [u,v] of edges){
    const a=graph.nodes[u].cell,b=graph.nodes[v].cell;
    const d=edgeDirection(a,b,template.width);
    if(!crossCells.includes(a))tilePortSets[a].add(d);
    if(!crossCells.includes(b))tilePortSets[b].add((d+2)%4);
  }
  for(const t of [...template.sources,...template.sinks])
    if(!crossCells.includes(t.cell))tilePortSets[t.cell].add(t.port);

  const tiles=tilePortSets.map((s,i)=>crossCells.includes(i)?
    {kind:"cross"}:{kind:"junction",ports:[...s].sort((a,b)=>a-b),rotation:0});
  const layout={...template,tiles};
  const result=traceNetwork(layout);
  if(!result.ready||result.pattern.join("")!==pattern)
    throw new Error("Constructed geometry witness failed real provenance check: "+pattern);
  return {layout, pattern, crossoverCells:crossCells.slice()};
}

export function enumerateConstructivePatterns(crossCells=[5],template=GLASS_KELP_TERMINALS){
  return ALL_MESSAGES.map(pattern=>({pattern,witness:makeRoutingWitness(pattern,crossCells,template)}));
}
