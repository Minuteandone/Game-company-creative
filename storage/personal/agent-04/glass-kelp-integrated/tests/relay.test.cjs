const test = require("node:test");
const assert = require("node:assert/strict");
const relay = require("../relay.js");

test("board contract is 4x4 with two sources and three semantic sinks", () => {
  assert.equal(relay.ROWS, 4);
  assert.equal(relay.COLS, 4);
  assert.equal(relay.TILE_TYPES.length, 16);
  assert.deepEqual(relay.SOURCES.map(s => s.id), ["A", "B"]);
  assert.deepEqual(relay.SINKS.map(s => s.id), ["when", "action", "why"]);
});

test("row boundaries never wrap horizontal neighbors", () => {
  assert.equal(relay.neighbor(3, relay.E), null);
  assert.equal(relay.neighbor(4, relay.W), null);
  assert.equal(relay.neighbor(7, relay.E), null);
  assert.equal(relay.neighbor(8, relay.W), null);
});

test("four rotations restore every tile's ports", () => {
  for (let cell = 0; cell < relay.TILE_TYPES.length; cell++) {
    const rotations = Array(16).fill(0);
    const original = relay.portsForCell(cell, rotations).slice().sort();
    const rotated = relay.rotate(rotations, cell, 4);
    assert.deepEqual(relay.portsForCell(cell, rotated).slice().sort(), original);
  }
});

test("all-zero control and authored player start are not transmission-ready", () => {
  for (const rotations of [relay.INITIAL_ROTATIONS, relay.PUZZLE_START]) {
    const result = relay.analyze(Array.from(rotations));
    assert.equal(result.ready, false);
    assert.equal(result.pattern, null);
  }
});

test("player-facing scramble is four clockwise rotations away from an AAB witness", () => {
  const next = Array.from(relay.PUZZLE_START);
  for (const cell of [0, 5, 10, 15]) next[cell] = (next[cell] + 1) % 4;
  const result = relay.analyze(next);
  assert.equal(result.ready, true);
  assert.equal(result.pattern, "AAB");
});

for (const pattern of relay.INTENDED_PATTERNS) {
  test("fixture reaches clean intended pattern " + pattern, () => {
    const result = relay.analyze(Array.from(relay.SOLUTION_FIXTURES[pattern]));
    assert.equal(result.ready, true);
    assert.equal(result.pattern, pattern);
    assert.equal(result.intendedPattern, true);
    for (const sink of result.sinkStates) {
      assert.equal(sink.state, "clean");
      assert.ok(sink.source === "A" || sink.source === "B");
    }
  });
}

test("planar first-island contract deliberately excludes alternating source patterns", () => {
  assert.deepEqual(
    Array.from(relay.INTENDED_PATTERNS),
    ["AAA", "AAB", "ABB", "BBB"]
  );
  for (const excluded of ["ABA", "BAA", "BAB", "BBA"]) {
    assert.equal(relay.INTENDED_PATTERNS.includes(excluded), false);
  }
});

test("interference is represented explicitly instead of silently preferring a source", () => {
  const collision = [
    0,3,3,3,
    1,0,0,1,
    2,0,0,0,
    3,0,0,0
  ];
  const result = relay.analyze(collision);
  assert.equal(result.ready, false);
  assert.ok(result.sinkStates.some(sink => sink.state === "interference"));
  assert.ok(result.cellSources.some(ids => ids.length === 2));
});
