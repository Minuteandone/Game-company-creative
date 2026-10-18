/* Glass Kelp integrated spike — coupled two-source relay model.
   agent-03 (AI agent), inspired by agent-02's spatial relay work and the
   semantic-filtering experiments from agents 03/04. No DOM dependencies.

   TOPOLOGY CONTRACT: each boolean crossover is an INSULATED two-channel
   crossover. The conductors exchange top/bottom position without joining.
   This is intentionally not an ordinary one-layer planar junction grid.
   Agent-02's feasibility proof shows the natural planar 4x4 layout cannot
   realize all eight semantic source patterns without such topology. */
(function (global) {
  "use strict";

  const SOURCES = Object.freeze({
    IONA: "iona",
    ORREN: "orren"
  });

  function initialState() {
    return { entry: false, mid: false, high: false };
  }

  function valid(state) {
    return !!state &&
      typeof state.entry === "boolean" &&
      typeof state.mid === "boolean" &&
      typeof state.high === "boolean";
  }

  function swapped(pair) {
    return [pair[1], pair[0]];
  }

  function rails(state) {
    if (!valid(state)) throw new TypeError("Invalid relay state");

    let pair = [SOURCES.IONA, SOURCES.ORREN];
    if (state.entry) pair = swapped(pair);
    const time = pair.slice();

    if (state.mid) pair = swapped(pair);
    const action = pair.slice();

    if (state.high) pair = swapped(pair);
    const reason = pair.slice();

    return Object.freeze({
      time: Object.freeze(time),
      action: Object.freeze(action),
      reason: Object.freeze(reason)
    });
  }

  function pattern(state) {
    const trace = rails(state);
    return Object.freeze([
      trace.time[0],
      trace.action[0],
      trace.reason[0]
    ]);
  }

  function key(stateOrPattern) {
    const p = Array.isArray(stateOrPattern) ? stateOrPattern : pattern(stateOrPattern);
    return p.map(source => source === SOURCES.IONA ? "a" : "b").join("");
  }

  function toggle(state, relay) {
    if (!valid(state)) throw new TypeError("Invalid relay state");
    if (!["entry", "mid", "high"].includes(relay)) throw new RangeError("Unknown relay");
    return Object.freeze({ ...state, [relay]: !state[relay] });
  }

  function stateForPattern(sourcePattern) {
    if (!Array.isArray(sourcePattern) || sourcePattern.length !== 3) {
      throw new TypeError("Expected three source IDs");
    }
    const [time, action, reason] = sourcePattern;
    for (const source of sourcePattern) {
      if (source !== SOURCES.IONA && source !== SOURCES.ORREN) {
        throw new RangeError("Unknown source ID");
      }
    }

    // Because each crossover flips every downstream tap:
    // entry decides TIME; mid decides whether ACTION differs from TIME;
    // high decides whether REASON differs from ACTION.
    return Object.freeze({
      entry: time === SOURCES.ORREN,
      mid: action !== time,
      high: reason !== action
    });
  }

  global.GKI_RELAY = Object.freeze({
    SOURCES,
    initialState,
    valid,
    rails,
    pattern,
    key,
    toggle,
    stateForPattern
  });
})(globalThis);
