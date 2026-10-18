/* Glass Kelp integrated relay core — agent-04 (AI agent)
   Dependency-free, browser + Node/CommonJS compatible.
*/
(function (global) {
  "use strict";

  const N = 0, E = 1, S = 2, W = 3;
  const DIRS = Object.freeze([
    Object.freeze([-1, 0]),
    Object.freeze([0, 1]),
    Object.freeze([1, 0]),
    Object.freeze([0, -1])
  ]);
  const OPPOSITE = Object.freeze([S, W, N, E]);
  const ROWS = 4;
  const COLS = 4;

  const BASE_PORTS = Object.freeze({
    straight: Object.freeze([N, S]),
    corner: Object.freeze([N, E]),
    tee: Object.freeze([N, E, W])
  });

  // This authored one-layer planar board intentionally supports four clean
  // source-order patterns, not all eight binary triples.
  const TILE_TYPES = Object.freeze([
    "tee", "straight", "straight", "tee",
    "corner", "corner", "tee", "tee",
    "tee", "tee", "tee", "tee",
    "corner", "tee", "straight", "tee"
  ]);

  const SOURCES = Object.freeze([
    Object.freeze({ id: "A", cell: 0, externalPort: W }),
    Object.freeze({ id: "B", cell: 12, externalPort: W })
  ]);

  const SINKS = Object.freeze([
    Object.freeze({ id: "when", cell: 3, externalPort: E }),
    Object.freeze({ id: "action", cell: 7, externalPort: E }),
    Object.freeze({ id: "why", cell: 11, externalPort: E })
  ]);

  const INITIAL_ROTATIONS = Object.freeze(Array(16).fill(0));

  // Authored player-facing scramble. Four clockwise rotations (cells 0, 5, 10, 15)
  // reach one AAB witness, but the player is free to construct any intended pattern.
  const PUZZLE_START = Object.freeze([
    3,3,3,2,
    1,3,0,1,
    2,3,2,2,
    3,1,3,2
  ]);

  // Verified witnesses. They are test fixtures, not UI shortcuts.
  const SOLUTION_FIXTURES = Object.freeze({
    AAA: Object.freeze([2,1,1,2, 1,3,0,1, 0,0,3,0, 2,0,1,0]),
    AAB: Object.freeze([0,3,3,2, 1,0,0,1, 2,3,3,2, 3,1,3,3]),
    ABB: Object.freeze([0,1,1,0, 3,2,2,2, 2,0,3,1, 3,0,0,3]),
    BBB: Object.freeze([3,0,3,2, 0,0,2,0, 1,2,0,0, 3,0,0,3])
  });

  const INTENDED_PATTERNS = Object.freeze(["AAA", "AAB", "ABB", "BBB"]);

  function normalizeRotation(value) {
    return ((Number(value) % 4) + 4) % 4;
  }

  function portsForType(type, rotation) {
    const base = BASE_PORTS[type];
    if (!base) throw new Error("Unknown tile type: " + type);
    const rot = normalizeRotation(rotation);
    return base.map((dir) => (dir + rot) % 4);
  }

  function portsForCell(cell, rotations) {
    if (!Number.isInteger(cell) || cell < 0 || cell >= TILE_TYPES.length) {
      throw new RangeError("Invalid cell index: " + cell);
    }
    return portsForType(TILE_TYPES[cell], rotations[cell] || 0);
  }

  function rowCol(cell) {
    return [Math.floor(cell / COLS), cell % COLS];
  }

  function neighbor(cell, dir) {
    const [row, col] = rowCol(cell);
    const [dr, dc] = DIRS[dir];
    const nr = row + dr;
    const nc = col + dc;
    if (nr < 0 || nr >= ROWS || nc < 0 || nc >= COLS) return null;
    return nr * COLS + nc;
  }

  function connectedNeighbors(cell, rotations) {
    const ports = new Set(portsForCell(cell, rotations));
    const result = [];
    for (const dir of ports) {
      const next = neighbor(cell, dir);
      if (next === null) continue;
      const nextPorts = new Set(portsForCell(next, rotations));
      if (nextPorts.has(OPPOSITE[dir])) result.push(next);
    }
    return result;
  }

  function sourceCanEnter(source, rotations) {
    return portsForCell(source.cell, rotations).includes(source.externalPort);
  }

  function propagateSource(source, rotations) {
    const reached = new Set();
    if (!sourceCanEnter(source, rotations)) return reached;
    const queue = [source.cell];
    reached.add(source.cell);
    while (queue.length) {
      const cell = queue.shift();
      for (const next of connectedNeighbors(cell, rotations)) {
        if (reached.has(next)) continue;
        reached.add(next);
        queue.push(next);
      }
    }
    return reached;
  }

  function analyze(rotations) {
    if (!Array.isArray(rotations) || rotations.length !== TILE_TYPES.length) {
      throw new Error("rotations must contain exactly " + TILE_TYPES.length + " values");
    }

    const normalized = rotations.map(normalizeRotation);
    const reachBySource = new Map();
    for (const source of SOURCES) {
      reachBySource.set(source.id, propagateSource(source, normalized));
    }

    const cellSources = Array.from({ length: TILE_TYPES.length }, () => []);
    for (let cell = 0; cell < TILE_TYPES.length; cell++) {
      for (const source of SOURCES) {
        if (reachBySource.get(source.id).has(cell)) cellSources[cell].push(source.id);
      }
    }

    const sinkStates = SINKS.map((sink) => {
      const hasOutputPort = portsForCell(sink.cell, normalized).includes(sink.externalPort);
      if (!hasOutputPort) {
        return { id: sink.id, cell: sink.cell, state: "dead", source: null };
      }
      const ids = cellSources[sink.cell];
      if (ids.length === 0) {
        return { id: sink.id, cell: sink.cell, state: "dead", source: null };
      }
      if (ids.length === 1) {
        return { id: sink.id, cell: sink.cell, state: "clean", source: ids[0] };
      }
      return { id: sink.id, cell: sink.cell, state: "interference", source: null };
    });

    const ready = sinkStates.every((sink) => sink.state === "clean");
    const pattern = ready ? sinkStates.map((sink) => sink.source).join("") : null;

    return {
      rotations: normalized,
      cellSources,
      sinkStates,
      ready,
      pattern,
      intendedPattern: ready && INTENDED_PATTERNS.includes(pattern)
    };
  }

  function rotate(rotations, cell, steps = 1) {
    if (!Array.isArray(rotations) || rotations.length !== TILE_TYPES.length) {
      throw new Error("rotations must contain exactly " + TILE_TYPES.length + " values");
    }
    if (!Number.isInteger(cell) || cell < 0 || cell >= TILE_TYPES.length) {
      throw new RangeError("Invalid cell index: " + cell);
    }
    const next = rotations.map(normalizeRotation);
    next[cell] = normalizeRotation(next[cell] + steps);
    return next;
  }

  function glyphFor(cell, rotations) {
    const type = TILE_TYPES[cell];
    const rot = normalizeRotation(rotations[cell] || 0);
    if (type === "straight") return rot % 2 === 0 ? "│" : "─";
    if (type === "corner") return ["└", "┌", "┐", "┘"][rot];
    if (type === "tee") return ["┴", "├", "┬", "┤"][rot];
    return "?";
  }

  const api = Object.freeze({
    N, E, S, W,
    ROWS, COLS,
    TILE_TYPES,
    SOURCES,
    SINKS,
    INITIAL_ROTATIONS,
    PUZZLE_START,
    INTENDED_PATTERNS,
    SOLUTION_FIXTURES,
    normalizeRotation,
    portsForType,
    portsForCell,
    neighbor,
    connectedNeighbors,
    analyze,
    rotate,
    glyphFor
  });

  global.GKRelay = api;
  if (typeof module !== "undefined" && module.exports) module.exports = api;
})(typeof globalThis !== "undefined" ? globalThis : this);
