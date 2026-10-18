// Dependency-free invariants for the Glass Kelp integrated spike.
// Executes the actual pure relay/content files used by the browser.
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const ctx = vm.createContext({});
for (const file of ["relay-model.js", "content.js"]) {
  vm.runInContext(fs.readFileSync(path.join(__dirname, file), "utf8"), ctx, { filename: file });
}
const Relay = ctx.GKI_RELAY;
const Content = ctx.GKI_CONTENT;

function plain(value) {
  return JSON.parse(JSON.stringify(value));
}

const bools = [false, true];

test("three coupled crossovers generate all eight source patterns exactly once", () => {
  const keys = new Set();
  for (const entry of bools) for (const mid of bools) for (const high of bools) {
    const state = { entry, mid, high };
    assert.equal(Relay.valid(state), true);
    keys.add(Relay.key(state));
  }
  assert.deepEqual([...keys].sort(), ["aaa","aab","aba","abb","baa","bab","bba","bbb"]);
});

test("relay coupling changes the promised downstream scope", () => {
  const base = Relay.initialState();
  assert.equal(Relay.key(base), "aaa");
  assert.equal(Relay.key(Relay.toggle(base, "entry")), "bbb", "ENTRY changes all three outputs");
  assert.equal(Relay.key(Relay.toggle(base, "mid")), "abb", "MID changes action + reason");
  assert.equal(Relay.key(Relay.toggle(base, "high")), "aab", "HIGH changes reason only");
});

test("every semantic pattern round-trips to one crossover state", () => {
  const sources = [Content.IONA, Content.ORREN];
  for (const time of sources) for (const action of sources) for (const reason of sources) {
    const p = [time, action, reason];
    const state = Relay.stateForPattern(p);
    assert.deepEqual(plain(Relay.pattern(state)), p);
  }
});

test("trace preserves both source identities at every stage", () => {
  for (const entry of bools) for (const mid of bools) for (const high of bools) {
    const trace = Relay.rails({entry,mid,high});
    for (const stage of ["time","action","reason"]) {
      assert.deepEqual([...plain(trace[stage])].sort(), ["iona","orren"]);
    }
  }
});

test("every slot has text for both sources", () => {
  assert.equal(Content.SLOTS.length, 3);
  for (const slot of Content.SLOTS) {
    assert.ok(slot.fragments.iona.length > 4);
    assert.ok(slot.fragments.orren.length > 4);
  }
});

test("all eight clean patterns have echoes and grammatical assembled text", () => {
  const sources = [Content.IONA, Content.ORREN];
  for (const time of sources) for (const action of sources) for (const reason of sources) {
    const p = [time, action, reason];
    const key = Content.patternKey(p);
    const text = Content.SLOTS.map((slot,i) => slot.fragments[p[i]]).join(" ");
    assert.match(text, /[.!?]$/);
    assert.ok(Content.ECHOES[key]);
    assert.ok(Content.ECHOES[key].echo.length > 20);
  }
});

test("all locations provide context and aftermath for every pattern", () => {
  const sources = [Content.IONA, Content.ORREN];
  for (const place of ["harbor","garden","lock"]) {
    assert.ok(Content.BEFORE[place].fact.length > 20);
    for (const time of sources) for (const action of sources) for (const reason of sources) {
      const after = Content.aftermath(place,[time,action,reason]);
      assert.ok(after.title.length > 5);
      assert.equal(after.paragraphs.length, 2);
      assert.ok(after.paragraphs.every(p => p.length > 40));
      assert.ok(after.quote.length > 20);
    }
  }
});

test("interpretation retains infrastructure state separately from source provenance", () => {
  const p = [Content.ORREN, Content.IONA, Content.ORREN];
  assert.deepEqual(plain(Content.interpret(p)), {
    time:"sunrise",
    action:"open",
    reason:"drown",
    pattern:["orren","iona","orren"]
  });
  assert.equal(Content.integrity(p, Content.IONA), 1);
  assert.equal(Content.integrity(p, Content.ORREN), 2);
});

test("artifact responds to committed gate state", () => {
  const opened = Content.ARTIFACT.describe([Content.IONA,Content.IONA,Content.IONA]);
  const sealed = Content.ARTIFACT.describe([Content.IONA,Content.ORREN,Content.IONA]);
  assert.notEqual(opened, sealed);
  assert.match(opened, /water level|uncurled/i);
  assert.match(sealed, /condensation|curled/i);
});
