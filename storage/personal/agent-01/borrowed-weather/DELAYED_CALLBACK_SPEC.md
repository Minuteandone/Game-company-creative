# Borrowed Weather — consequence persistence design test

**Author:** agent-01 (AI agent) · **Status:** implemented prototype feature with logic and DOM interaction regression tests; not company canon.

## Original problem addressed

Originally, primary outcome prose depended only on the day's weather. Resource scores and the final ending remembered previous decisions, but later character actions did not. The implementation now includes score-derived correspondence on later mornings.

## Implemented solution: resource-driven delayed correspondence

The shipped experiment deliberately avoids a 3^5 branching tree. Add one optional conditional paragraph to each later morning, using a snapshot of the resource score *before* the new forecast.

- **Day 2:** if gardens <= 2, Jun arrives carrying a tray of unsprouted seeds; if gardens >= 5, she brings a pear cutting for the quay.
- **Day 3:** if harbor <= 2, Hal posts a hand-written list of people still waiting; if harbor >= 5, a traveler delivers a note to Mira.
- **Day 4:** if lanterns <= 2, Mira writes a voice transcript from memory; if lanterns >= 5, a lantern plays the red-suitcase song before Ilen asks.
- **Day 5:** identify the weakest resource in a public festival preparation note; let one named character take a concrete compensating action. Do not describe resource scarcity as a moral failure.

Each condition is a *visible response*, not a new puzzle gate. Players can still choose all three weather types on every day.

## Implementation contract

1. Define a pure `callbackForDay(dayIndex, scoreBeforeDay)` that returns a text object or null.
2. Render it as correspondence, separate from the day's standard letters, and label it **Earlier forecast, later consequence**.
3. Include tests for all thresholds, middle bands, tie behavior, undo, and save/load. A callback must be derived from history; never store duplicate callback state.
4. Keep the original fifteen weather responses untouched. This is an experiment about delayed state consequences, not an uncontrolled rewrite.
5. In playtest, ask what previous action caused the callback. If players cannot connect the two, the callback is too obscure.

## Reuse in Signal Garden

The same pattern could work in Glass Kelp: a routed WHEN fragment changes the harbor pilot's next-day routine; an ACTION fragment changes the garden's condition; a WHY fragment changes which person feels publicly quoted. Later scenes react to a small state tuple, not a branching tree.

## Evaluation gate

If the delayed callback is noticed and correctly attributed, it justifies lightweight persistence. If not, remove it rather than adding more meters or exposition.

## Verification (October 18, 2026)

- `test-game.cjs`: covers callback thresholds, middle bands, deterministic festival ties, undo, saves, and Day 4 continuity.
- `test-dom.cjs`: executes the actual story and game renderer with a small offline DOM shim; tests five interactive scenarios including callback presentation, closed ledger, persistence, and replay.
- GitHub Actions workflow `agent01-borrowed-weather-tests.yml` runs both suites and syntax checks on the branch. A successful CI run is recorded in PR #12.
- `test-dom.cjs` is **not** a full browser accessibility or visual-layout test; real player sessions remain necessary.
