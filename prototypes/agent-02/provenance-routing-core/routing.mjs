/**
 * Source-provenance routing core for the Signal Garden integration experiment.
 * Author: agent-02 (AI agent).
 *
 * No DOM, engine, audio, story data or external dependencies.
 * Directions: 0=N, 1=E, 2=S, 3=W.
 * A "cross" tile has two insulated, independent channels: N↔S and E↔W.
 * Plain junction tiles have one channel combining all rotated ports.
 */

export function neighbor(cell, direction, width, height) {
  if (!Number.isInteger(cell) || !Number.isInteger(direction) ||
      !Number.isInteger(width) || !Number.isInteger(height) ||
      width <= 0 || height <= 0 || cell < 0 || cell >= width * height ||
      direction < 0 || direction > 3) return -1;
  const row = Math.floor(cell / width), col = cell % width;
  if (direction === 0) return row ? cell - width : -1;
  if (direction === 1) return col < width - 1 ? cell + 1 : -1;
  if (direction === 2) return row < height - 1 ? cell + width : -1;
  return col ? cell - 1 : -1;
}

export function rotatePorts(ports, quarterTurns = 0) {
  if (!Array.isArray(ports) || !Number.isInteger(quarterTurns))
    throw new TypeError("ports must be an array and quarterTurns must be an integer");
  if (ports.some(p => !Number.isInteger(p) || p < 0 || p > 3) ||
      new Set(ports).size !== ports.length)
    throw new TypeError("ports must be unique cardinal directions 0–3");
  return ports.map(d => (d + ((quarterTurns % 4) + 4) % 4) % 4);
}

export function tileChannels(tile) {
  if (!tile || typeof tile !== "object") throw new TypeError("Invalid tile");
  if (tile.kind === "cross") {
    if (tile.rotation !== undefined && tile.rotation !== 0)
      throw new TypeError("The insulated crossover is fixed and cannot rotate");
    return [[0, 2], [1, 3]];
  }
  if (tile.kind !== undefined && tile.kind !== "junction")
    throw new TypeError("Unknown tile kind: " + tile.kind);
  return [rotatePorts(tile.ports ?? [], tile.rotation ?? 0)];
}

function validateTerminal(terminal, width, height, kind) {
  if (!terminal || typeof terminal.id !== "string" || !terminal.id ||
      !Number.isInteger(terminal.cell) || !Number.isInteger(terminal.port) ||
      terminal.port < 0 || terminal.port > 3 ||
      neighbor(terminal.cell, terminal.port, width, height) !== -1 ||
      terminal.cell < 0 || terminal.cell >= width * height)
    throw new TypeError("Invalid external " + kind + " terminal");
}

/**
 * @param {object} layout
 * @param {number} layout.width
 * @param {number} layout.height
 * @param {object[]} layout.tiles - length width*height, each {ports:[...], rotation:0..3}
 *                                or {kind:"cross"} for two insulated tracks.
 * @param {object[]} layout.sources - {id,cell,port} source ingress at an external edge.
 * @param {object[]} layout.sinks - {id,cell,port} receiver on an external edge.
 * @returns {{ready:boolean, pattern:string[]|null, sinks:object[], cells:object[]}}
 */
export function traceNetwork(layout) {
  if (!layout || !Number.isInteger(layout.width) || !Number.isInteger(layout.height) ||
      layout.width <= 0 || layout.height <= 0 ||
      !Array.isArray(layout.tiles) || layout.tiles.length !== layout.width * layout.height ||
      !Array.isArray(layout.sources) || !Array.isArray(layout.sinks))
    throw new TypeError("Invalid routing layout");

  const {width, height, sources, sinks} = layout;
  const allTerminals = [...sources, ...sinks];
  allTerminals.forEach(t => validateTerminal(t, width, height, "routing"));
  if (new Set(sources.map(s => s.id)).size !== sources.length ||
      new Set(sinks.map(s => s.id)).size !== sinks.length)
    throw new TypeError("Duplicate terminal ids");
  if (!sources.length || !sinks.length) throw new TypeError("Sources and sinks required");

  const channelByCell = [];
  const tracks = [];
  for (let cell = 0; cell < layout.tiles.length; cell++) {
    const channels = tileChannels(layout.tiles[cell]);
    const indices = channels.map(ports => {
      const index = tracks.length;
      tracks.push({cell, ports, adjacent: new Set(), reached: new Set()});
      return index;
    });
    channelByCell.push(indices);
  }
  const channelAtPort = (cell, port) =>
    channelByCell[cell].find(index => tracks[index].ports.includes(port));

  for (let cell = 0; cell < layout.tiles.length; cell++) {
    for (let direction = 0; direction < 4; direction++) {
      const n = neighbor(cell, direction, width, height);
      if (n === -1) continue;
      const first = channelAtPort(cell, direction);
      const second = channelAtPort(n, (direction + 2) % 4);
      if (first === undefined || second === undefined) continue;
      tracks[first].adjacent.add(second);
      tracks[second].adjacent.add(first);
    }
  }

  for (const source of sources) {
    const entry = channelAtPort(source.cell, source.port);
    if (entry === undefined) continue; // Unconnected input is not energized.
    const queue = [entry], seen = new Set(queue);
    for (let i = 0; i < queue.length; i++) {
      const at = queue[i];
      tracks[at].reached.add(source.id);
      for (const next of tracks[at].adjacent) {
        if (!seen.has(next)) {
          seen.add(next);
          queue.push(next);
        }
      }
    }
  }

  const resolved = sinks.map(sink => {
    const entry = channelAtPort(sink.cell, sink.port);
    const ids = entry === undefined ? [] : [...tracks[entry].reached].sort();
    return {
      id: sink.id,
      state: ids.length === 0 ? "dead" : ids.length === 1 ? "clean" : "interference",
      source: ids.length === 1 ? ids[0] : null,
      sources: ids
    };
  });
  const ready = resolved.every(s => s.state === "clean");
  return {
    ready,
    pattern: ready ? resolved.map(s => s.source) : null,
    sinks: resolved,
    cells: channelByCell.map(indices => ({
      channels: indices.map(index => ({
        ports: tracks[index].ports.slice(),
        sources: [...tracks[index].reached].sort(),
        state: tracks[index].reached.size === 0 ? "dead" :
          tracks[index].reached.size === 1 ? "clean" : "interference"
      }))
    }))
  };
}
