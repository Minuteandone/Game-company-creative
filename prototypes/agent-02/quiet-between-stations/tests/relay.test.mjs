// agent-02 (AI agent): dependency-free invariant tests for the *actual* inline puzzle logic.
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { runInNewContext } from "node:vm";
import test from "node:test";

const page = readFileSync(new URL("../index.html", import.meta.url), "utf8");
const script = page.match(/<script>([\s\S]*?)<\/script>/)?.[1];
assert.ok(script, "index.html has exactly one inline application script");
const setupBoundary = script.indexOf('    $("reset").addEventListener(');
assert.ok(setupBoundary > 0, "Application must expose logic before registering DOM listeners");

function puzzle() {
  // Stop before DOM setup; there are no mocked game rules, just the original functions.
  return runInNewContext(
    script.slice(0, setupBoundary) +
      "\n;({chapters,state,direction,neighbor,ports,network,buildTiles})",
    {},
    { timeout: 2000 },
  );
}

test("each authored route has valid adjacent steps", () => {
  const { chapters, direction } = puzzle();
  for (const chapter of chapters) {
    assert.ok(chapter.path.length >= 2);
    assert.equal(new Set(chapter.path).size, chapter.path.length, "No duplicate path nodes");
    for (let j = 1; j < chapter.path.length; j++) {
      assert.doesNotThrow(() => direction(chapter.path[j-1], chapter.path[j]));
    }
    assert.ok(chapter.path.every(i => Number.isInteger(i) && i >= 0 && i < 16));
  }
});

test("all four puzzles start unsolved and have an actual winning route", () => {
  const { chapters, state, buildTiles, network, ports } = puzzle();
  assert.equal(chapters.length, 4, "Four transmissions must exist");
  chapters.forEach((chapter, i) => {
    state.chapter = i;
    buildTiles();
    assert.equal(state.tiles.length, 16);
    assert.equal(network().connected, false, "Circuit " + (i+1) + " starts unsolved");
    chapter.path.forEach(tileIndex => {
      state.tiles[tileIndex].rotation = 0;
    });
    assert.equal(network().connected, true, "Circuit " + (i+1) + " has a solution");
    assert.ok(ports(chapter.path[0]).includes(chapter.sourcePort));
    assert.ok(ports(chapter.path.at(-1)).includes(chapter.sinkPort));
  });
});

test("connection algorithm never wraps east/west across grid edges", () => {
  const { neighbor } = puzzle();
  assert.equal(neighbor(3,1), -1);
  assert.equal(neighbor(4,3), -1);
  assert.equal(neighbor(0,0), -1);
  assert.equal(neighbor(15,2), -1);
  assert.equal(neighbor(0,1), 1);
  assert.equal(neighbor(0,2), 4);
});

test("rotating a tile four times restores its ports", () => {
  const { state, ports, buildTiles } = puzzle();
  state.chapter = 0;
  buildTiles();
  const before = ports(0).join(",");
  for (let turn=0; turn<4; turn++) state.tiles[0].rotation = (state.tiles[0].rotation+1)%4;
  assert.equal(ports(0).join(","), before);
});

test("alternate decoy arrangements cannot invalidate an intact authored route", () => {
  const { state, chapters, network, buildTiles } = puzzle();
  chapters.forEach((chapter,i) => {
    state.chapter=i;
    buildTiles();
    const path = new Set(chapter.path);
    chapter.path.forEach(cell => state.tiles[cell].rotation=0);
    state.tiles.forEach((tile,index) => {
      if (!path.has(index)) tile.rotation=(tile.rotation+2)%4;
    });
    assert.equal(network().connected,true);
  });
});
