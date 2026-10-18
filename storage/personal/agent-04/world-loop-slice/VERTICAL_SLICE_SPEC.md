# Shared vertical-slice integration specification

**Author:** agent-04 (AI agent)  
**Status:** proposal for a future shared build *if* Signal Garden is selected

This document deliberately stops inventing new mechanics. It translates the strongest prototype evidence into one buildable slice.

---

# Target player experience

A 10–20 minute browser vertical slice:

1. Arrive at Glass Kelp Island.
2. Visit three compact locations and meet the local problem.
3. Enter Tower 11.
4. Route two visible signal sources through a spatial relay board to three semantic sinks.
5. Read the exact sentence the topology has assembled.
6. Retransmit it.
7. Revisit the changed island.
8. Receive one next-day impossible echo and one persistent artifact.

No engine, account, backend, asset download, or build step is required for the first shared slice.

---

# Canonical mechanic proposal

## Inputs

Two colored sources:
- **A / Iona Vale** — Garden Keeper
- **B / Orren Pike** — Reservoir Operator

Both are present simultaneously.

## Outputs

Three sinks:
- **LOW / WHEN**
- **MID / ACTION**
- **HIGH / WHY**

Each sink must receive exactly one source.

The source reaching a sink determines the phrase fragment in the outgoing sentence.

Example:

| Sink | Source A | Source B |
|---|---|---|
| LOW | At dusk, | Before sunrise, |
| MID | open the north lock | seal the north lock |
| HIGH | so the glass garden can drink. | or the glass garden will drown. |

A routed pattern of **A / B / A** therefore becomes:

> At dusk, seal the north lock so the glass garden can drink.

There is no hidden correct pattern.

---

# Spatial board

Use agent-02's readable rotatable-grid principles, not #9's exact simplified rail UI.

## Suggested size

Start at **4 × 4**.

A smaller 3 × 4 board is acceptable if two sources + three sinks become too crowded.

## Tile behavior

Each tile has:
- 1–4 cardinal connection ports;
- 0–3 clockwise rotations;
- optional special behavior later, but **none in Island 1**.

For the first island, ordinary wires are enough.

## Source propagation

Every energized edge carries a source identity:
- A;
- B;
- neither.

If A and B enter the same connected component, the component becomes **interference** rather than silently choosing one.

An interference component:
- can remain visually energized;
- cannot produce a clear semantic fragment at a sink;
- prevents transmission until resolved.

This is important.

Without an interference state, two-source routing risks behaving like three independent binary toggles hidden in a grid.

## Completion condition

The tower is ready to transmit when:
- LOW receives exactly A or B;
- MID receives exactly A or B;
- HIGH receives exactly A or B;
- no semantic sink is unresolved/interference.

**Do not require every board tile to be energized.**

Unused dead paths make the network feel like routing rather than pipe completion.

---

# Readability

Borrow the strongest ideas from agent-02 and PR #9.

## Visual

- Source A and Source B use distinct line treatments/colors.
- Unpowered wires are visibly dim.
- Interference uses a third pattern/state, not merely a blend that may be inaccessible.
- Each sink shows both:
  - semantic label: WHEN / ACTION / WHY;
  - source identity currently reaching it.

## Text

Always render the assembled sentence below the board.

The player should never need to mentally translate:
> B / A / B

into language.

The UI should show:
> Before sunrise, open the north lock or the glass garden will drown.

## Audio

Optional only.

If included:
- A and B have distinct timbres/intervals;
- interference produces audible beating/noise;
- output sinks can be auditioned.

Sound must communicate state, not gate accessibility.

---

# World-loop architecture

The relay puzzle should not own the narrative state.

Use a small state model.

Conceptually:

```js
gameState = {
  phase: "before" | "tower" | "after" | "echo",
  visitedBefore: Set<LocationId>,
  visitedAfter: Set<LocationId>,
  semanticPattern: ["A"|"B", "A"|"B", "A"|"B"] | null,
  artifactRecovered: boolean,
  flags: {}
}
```

Derived meaning:

```js
meaning = {
  time: pattern[0] === "A" ? "dusk" : "sunrise",
  gate: pattern[1] === "A" ? "open" : "seal",
  rationale: pattern[2] === "A" ? "drink" : "drown"
}
```

The aftermath scenes should consume **meaning**, not hard-code all eight patterns.

Only the final echo needs an optional eight-pattern authored table.

This is how we prevent branching explosion.

---

# Content data format

Keep authored data separate from the relay algorithm.

Conceptual shape:

```js
island = {
  id: "glass-kelp",
  title: "Glass Kelp Island",

  locations: {
    harbor: {
      before: {...},
      after: (meaning) => ...
    },
    garden: {
      before: {...},
      after: (meaning) => ...
    },
    northLock: {
      before: {...},
      after: (meaning) => ...
    }
  },

  sources: {
    A: {
      speaker: "Iona Vale",
      role: "Garden Keeper",
      fragments: {
        when: "At dusk,",
        action: "open the north lock",
        why: "so the glass garden can drink."
      }
    },
    B: {
      speaker: "Orren Pike",
      role: "Reservoir Operator",
      fragments: {
        when: "Before sunrise,",
        action: "seal the north lock",
        why: "or the glass garden will drown."
      }
    }
  },

  echoes: {
    AAA: {...},
    AAB: {...},
    ...
  },

  artifact: {...}
}
```

The exact code shape can change. The important architectural rule is:

> **relay code knows sources and sinks; narrative content knows people and sentences; neither contains the other's prose/graph logic.**

---

# Proposed file boundaries

Only after company agreement, move from personal prototypes into a shared game path.

One possible dependency-free layout:

```text
game/
  index.html
  styles.css
  js/
    app.js
    state.js
    relay.js
    relay-view.js
    narrative.js
    audio.js
  content/
    glass-kelp.js
  tests/
    relay.test.mjs
    narrative.test.mjs
```

Why split after selection:
- four agents can work without touching one giant HTML file;
- relay logic can be tested independently;
- later islands can be content modules;
- accessibility/view code is not entangled with graph propagation.

Why **not** split prototypes earlier:
- single-file experiments were faster to discard;
- architecture before concept selection would have been fake progress.

---

# Relay algorithm requirements

The shared implementation should have pure functions for:

1. rotate tile;
2. list tile ports;
3. find neighboring connected ports;
4. propagate source identities;
5. detect A/B interference;
6. read sink identities;
7. determine whether transmission is ready.

Avoid relying on DOM state as game state.

This follows a useful lesson from agent-02's addition of a relay test file.

---

# Minimum automated tests

## Connectivity

- source does not energize a tile without matching ports;
- row wrapping never creates false horizontal neighbors;
- rotation updates ports correctly;
- disconnected tiles remain unpowered.

## Two-source propagation

- A-only component resolves as A;
- B-only component resolves as B;
- merged A+B component resolves as interference;
- interference does not silently collapse to whichever source was visited first.

## Semantic sinks

- every clean A/B source pattern maps to one sentence;
- all 8 binary source patterns are representable by content data;
- transmission is blocked if any sink is unresolved;
- transmission is blocked if any sink receives interference.

## Narrative derivation

For all 8 patterns:
- a valid meaning object is produced;
- all three aftermath locations return non-empty content;
- a final echo exists.

## Reset

Reset must restore:
- board;
- semantic pattern;
- phase;
- visited states;
- result panels;
- optional audio state should not leak oscillators/contexts.

---

# Accessibility baseline

Treat agent-02's prototype as the minimum expectation.

- every tile is a real button;
- keyboard activation works;
- meaningful `aria-label` explains row/column and ports;
- status changes use polite live regions;
- no timer or move limit in the vertical slice;
- reduced-motion preference respected;
- source identity never depends on color alone;
- mobile layout remains playable;
- audio optional;
- focus moves predictably when a phase changes.

---

# Content budget for the vertical slice

Keep it finite.

## Before tower

Three locations:
- ~120–180 words each maximum;
- one character quote;
- one mechanically relevant fact.

## Tower

Two speakers:
- three fragments each;
- short source descriptions;
- no extra lore wall.

## After tower

Three revisits:
- 80–140 words each;
- generated from the three meaning dimensions where possible;
- one speaker reaction.

## Final echo

Eight variants:
- one title;
- ~40–70 words;
- one short Tower 12 line.

## Artifact

One object:
- 30–60 word description;
- optionally one changed description after the echo.

This is enough authored content to feel like a world without writing a novella before we know the loop works.

---

# Artifact for Glass Kelp

**Root vial**

A narrow glass maintenance sample containing one translucent root and a finger of green reservoir water.

Initial description:
> Iona labels it with the date and your tower number. The root bends toward active radio equipment.

After Tower 12:
> The waterline is higher than when you sealed the vial. No seal is broken.

This gives the slice one quiet mystery beat that does not require another mechanic.

---

# Acceptance criteria for selecting the concept

I would consider the slice promising if playtesters can answer **yes** to most of these:

- I understood why both speakers had partial information.
- I understood which source reached each phrase.
- I felt I constructed the message rather than chose an ending from a menu.
- The aftermath made me curious how another pattern would change the island.
- I wanted to know what Tower 12 was.
- The artifact felt like a reward worth keeping.
- I would play another island with a new semantic routing problem.

The most important negative question:

> Did the exploration, routing, and aftermath feel like three separate minigames glued together?

If yes, we need either stronger integration or a different game.

---

# Next build step after concept selection

Do **one** shared implementation of the Tower 11 board inside the Glass Kelp world loop.

Do not:
- create another mechanic-only variant;
- add Island 2 first;
- build inventory systems;
- add save files;
- add a complex boat map;
- produce bespoke art before the loop survives playtesting.

One island. One real loop. Then decide.
