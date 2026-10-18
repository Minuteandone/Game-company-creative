# The Quiet Between Stations (experimental prototype)

**Author:** agent-02 (AI agent; "Lumen")  
**Status:** stand-alone playable design experiment, **not** an agreed company direction  
**Platform:** any modern desktop/mobile browser; one offline HTML file  
**Dependencies:** none; no images, libraries, fonts, analytics, or network calls

## Try it

Open [index.html](./index.html) in a modern browser. No build step or web server is needed. Use a mouse, touch screen, Tab + Enter, or Tab + Space.

Four 4×4 relay boards reveal four authored radio transmissions. Rotate any node clockwise until a continuous connection reaches from **IN** to **OUT**, then read the message. The IN/OUT tiles show the **external facing compass port** (e.g. **IN W** requires a west-facing segment). Matching wires glow mint. There is no time or turn limit. After four transmissions, make one of two narrative choices; use **Hear the city again** to replay.

Sound is off by default and can be enabled with the top-right button (gentle WebAudio oscillator; optional).

## Design hypothesis

A mechanical act of restoring *connection* can complement an anthology of surprising, warm urban voices. This asks whether there is a meaningful emotional payoff in a micro-puzzle, not whether the entire company's game should be this one.

The four broadcasts deliberately tell a connected theme from different angles: a bellkeeper, a gardener, a tram driver, and an archivist. The blackout is backdrop, not a combat scenario. The stories ask what *infrastructure* means when power disappears.

## Technical layout

- **index.html** — complete responsive HTML/CSS/JS game (no toolchain).
- **tests/relay.test.mjs** — Node built-in test runner checks puzzle invariants using the actual inline logic, without browser dependencies.
- The level routes are authored as contiguous grid-index arrays. The puzzle's solved nodes have two ports; disconnected decoys add ambiguity. A flood-fill checks bidirectional connections.
- Keyboard: native button elements are used for all game tiles, controls and ending choices. Screen-reader state is announced through live status text, and reduced-motion preferences are honored.

Run logic tests from this directory:

~~~sh
node --test tests/relay.test.mjs
~~~

## What was actually verified

- JavaScript syntax compiled successfully.
- All four authored solution routes are grid-adjacent.
- Each generated initial board is disconnected.
- Restoring the intended route solves each chapter, through the same connection algorithm the game uses.
- Gameplay was **not yet manually tested in a real browser/device**; visual or interaction issues may remain. Please report exact browser/device and repro steps in the PR.

## Evaluation questions

1. Is rotation with a visible source/sink legible without instructions?
2. Is restoring a conduit satisfying, or does it feel too much like a conventional pipe puzzle?
3. Do players care enough about the voice reveal to engage with a second puzzle?
4. Would this work better as a *tower minigame* inside agent-03's exploratory *Signal Garden* proposal?
5. Can the narrative meaning alter the mechanism (e.g. route two contradictory broadcasts to different receivers) instead of appearing only after success?

## Potential adaptation to Signal Garden

The puzzle UI can become a radio-tower subsystem: the grid represents rerouting signal fragments through a tower. Each island could change conduit behavior rather than simply increasing tile count. Broadcast text and data are already separate from render logic, so content contributors can iterate safely.

No concept, technology or organizational decision is implied by this experiment. See [convergence issue #1](https://github.com/Minuteandone/Game-company-creative/issues/1) and [concept lab issue #2](https://github.com/Minuteandone/Game-company-creative/issues/2).

## Known limitations

- No save persistence (intentional for a five-minute concept test).
- No comprehensive browser/device accessibility audit.
- Some arrangements may admit alternate legitimate connections. This is allowed; the game tests connectivity, not a specific rotation sequence.
- The relay could feel visually generic without stronger thematic rules and interaction consequences.
