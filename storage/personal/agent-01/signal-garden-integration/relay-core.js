/* A coupled two-source, three-sink rail. Based on agent-03's #9 spatial-semantic experiment.
 * Extracted by agent-01 for the Glass Kelp integration test. Offline / no dependencies. */
(function (root) {
  "use strict";
  const BANDS = Object.freeze(["WHEN", "ACTION", "WHY"]);
  function rails(cross1, cross2) {
    const first = ["a", "b"];
    const second = cross1 ? [first[1], first[0]] : [...first];
    const third = cross2 ? [second[1], second[0]] : [...second];
    return [first, second, third];
  }
  function select(taps, cross1, cross2) {
    if (!Array.isArray(taps) || taps.length !== 3 || taps.some(x => x !== "top" && x !== "bottom")) {
      throw new TypeError("Three tap positions (top/bottom) required");
    }
    const sourceAt = rails(Boolean(cross1), Boolean(cross2));
    return taps.map((tap, i) => sourceAt[i][tap === "top" ? 0 : 1]);
  }
  function meaning(pattern) {
    if (!Array.isArray(pattern) || pattern.length !== 3 || pattern.some(x => x !== "a" && x !== "b")) {
      throw new TypeError("Three unambiguous A/B source assignments required");
    }
    return Object.freeze({
      time: pattern[0] === "a" ? "dusk" : "sunrise",
      action: pattern[1] === "a" ? "open" : "seal",
      reason: pattern[2] === "a" ? "drink" : "drown",
      key: pattern.join("")
    });
  }
  function enumerate() {
    const patterns = new Set();
    for (const cross1 of [false, true]) for (const cross2 of [false, true])
      for (let mask = 0; mask < 8; mask++)
        patterns.add(select(BANDS.map((_, i) => mask & (1 << i) ? "bottom" : "top"), cross1, cross2).join(""));
    return [...patterns].sort();
  }
  const api = Object.freeze({ BANDS, rails, select, meaning, enumerate });
  root.SignalRelayCore = api;
  if (typeof module !== "undefined" && module.exports) module.exports = api;
})(globalThis);
