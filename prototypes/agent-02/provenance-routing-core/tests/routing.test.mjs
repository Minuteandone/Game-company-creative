/**
 * agent-02 (AI agent) — relay tests, run: node --test tests/routing.test.mjs
 * Tests the PRODUCTION MODULES, not a copied implementation of their logic.
 */
import test from "node:test";
import assert from "node:assert/strict";
import {neighbor, rotatePorts, tileChannels, traceNetwork} from "../routing.mjs";
import {ALL_MESSAGES, makeRoutingWitness, enumerateConstructivePatterns} from "../geometry.mjs";

const t=ports=>({kind:"junction",ports});
function path1x2(left,right){
  return {
    width:2,height:1,tiles:[t(left),t(right)],
    sources:[{id:"A",cell:0,port:3}],sinks:[{id:"when",cell:1,port:1}]
  };
}

test("no false east/west wrapping; bad directions are rejected",()=>{
  assert.equal(neighbor(3,1,4,4),-1);
  assert.equal(neighbor(4,3,4,4),-1);
  assert.equal(neighbor(0,0,4,4),-1);
  assert.equal(neighbor(15,2,4,4),-1);
  assert.equal(neighbor(3,2,4,4),7);
  assert.equal(neighbor(3,1,0,4),-1);
  assert.equal(neighbor(-1,1,4,4),-1);
});

test("rotations are reversible, unique-port validation is enforced",()=>{
  assert.deepEqual(rotatePorts([0,2],1),[1,3]);
  assert.deepEqual(rotatePorts([0,2],4),[0,2]);
  assert.deepEqual(rotatePorts([0,2],-1),[3,1]);
  assert.throws(()=>rotatePorts([0,0]),TypeError);
  assert.deepEqual(tileChannels({kind:"cross"}),[[0,2],[1,3]]);
  assert.throws(()=>tileChannels({kind:"cross",rotation:1}),TypeError);
});

test("clean single-source reciprocal path makes a sentence slot ready",()=>{
  const net=traceNetwork(path1x2([3,1],[3,1]));
  assert.equal(net.ready,true);
  assert.deepEqual(net.pattern,["A"]);
  assert.deepEqual(net.sinks,[{id:"when",state:"clean",source:"A",sources:["A"]}]);
});

test("missing source port and non-reciprocal edge cannot energize sink",()=>{
  const noEntry=traceNetwork(path1x2([1],[3,1]));
  assert.equal(noEntry.sinks[0].state,"dead");
  assert.equal(noEntry.ready,false);
  const mismatched=traceNetwork(path1x2([3,1],[1]));
  assert.equal(mismatched.sinks[0].state,"dead");
});

test("rotated tile ports are honored by tracing",()=>{
  const layout=path1x2([0,2],[3,1]);
  layout.tiles[0].rotation=1; // vertical becomes west-east
  assert.equal(traceNetwork(layout).ready,true);
});

test("two source identities collide only when channels actually mix",()=>{
  const tiles=[t([3,1]),t([0,1,3]),t([3,1])];
  const collision=traceNetwork({
    width:3,height:1,tiles,
    sources:[{id:"A",cell:0,port:3},{id:"B",cell:2,port:1}],
    sinks:[{id:"when",cell:1,port:0}]
  });
  assert.equal(collision.ready,false);
  assert.equal(collision.pattern,null);
  assert.equal(collision.sinks[0].state,"interference");
  assert.deepEqual(collision.sinks[0].sources,["A","B"]);
});

test("insulated crossover separates crossing speakers on the same tile",()=>{
  const tiles=Array.from({length:9},()=>t([]));
  tiles[1]=t([0,2]);tiles[3]=t([1,3]);tiles[4]={kind:"cross"};
  tiles[5]=t([1,3]);tiles[7]=t([0,2]);
  const layout={
    width:3,height:3,tiles,
    sources:[{id:"A",cell:3,port:3},{id:"B",cell:1,port:0}],
    sinks:[{id:"horizontal",cell:5,port:1},{id:"vertical",cell:7,port:2}]
  };
  const net=traceNetwork(layout);
  assert.equal(net.ready,true);
  assert.deepEqual(net.pattern,["A","B"]);
  assert.deepEqual(net.cells[4].channels.map(c=>c.sources),[["B"],["A"]]);

  // Same four external ports, but one junction mixes both channels.
  layout.tiles[4]=t([0,1,2,3]);
  const mixed=traceNetwork(layout);
  assert.equal(mixed.ready,false);
  assert.ok(mixed.sinks.every(s=>s.state==="interference"));
});

test("all sinks, not some sinks, must be clean before transmitting",()=>{
  const layout=path1x2([3,1],[3,1]);
  layout.sinks.push({id:"unpowered",cell:0,port:0});
  const result=traceNetwork(layout);
  assert.equal(result.sinks[0].state,"clean");
  assert.equal(result.sinks[1].state,"dead");
  assert.equal(result.ready,false);
  assert.equal(result.pattern,null);
});

test("bad terminal positions and duplicate ids fail loudly",()=>{
  const invalid=path1x2([3,1],[3,1]);
  invalid.sinks[0].port=3; // west is internal at cell 1, not external
  assert.throws(()=>traceNetwork(invalid),TypeError);
  const duplicate=path1x2([3,1],[3,1]);
  duplicate.sources.push({id:"A",cell:1,port:1});
  assert.throws(()=>traceNetwork(duplicate),TypeError);
});

test("uncrossed 4x4 natural terminal geometry admits only four messages",()=>{
  const results=enumerateConstructivePatterns([]);
  const accessible=results.filter(r=>r.witness).map(r=>r.pattern);
  assert.deepEqual(accessible,["AAA","AAB","ABB","BBB"]);
  for(const invalid of ["ABA","BAA","BAB","BBA"])
    assert.equal(makeRoutingWitness(invalid,[]),null);
});

test("one insulated crossover at cell 5 permits all eight constructive witnesses",()=>{
  const results=enumerateConstructivePatterns([5]);
  assert.deepEqual(results.map(r=>r.pattern),ALL_MESSAGES);
  assert.ok(results.every(r=>r.witness));
  for(const {pattern,witness} of results){
    const net=traceNetwork(witness.layout);
    assert.equal(net.ready,true,pattern);
    assert.equal(net.pattern.join(""),pattern);
    assert.equal(witness.layout.tiles[5].kind,"cross");
  }
});

test("constructive witnesses are NOT misrepresented as one fixed tile inventory",()=>{
  const witnesses=enumerateConstructivePatterns([5]).map(x=>x.witness.layout.tiles);
  const signature=tiles=>tiles.map(t=>t.kind==="cross"?"cross":
    t.ports.length+"-port").join("|");
  assert.ok(new Set(witnesses.map(signature)).size>1,
    "A witness can change tile degrees: rotational reachability remains unproven");
});
