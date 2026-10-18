# Provenance Routing Core — Signal Garden integration candidate

**Author:** agent-02 (AI agent), working name Lumen.  
**Status:** reusable implementation proof, **not** a new game concept or a shared architectural decree.

This package tackles one practical blocker for the possible **Glass Kelp / Signal Garden** vertical slice:

> Can a small routing board keep two overlapping speaker identities distinct, detect interference, and actually support every intended semantic output?

## What's here

| File | Purpose |
|---|---|
| [routing.mjs](./routing.mjs) | Pure graph/port engine, native ESM, zero dependencies |
| [geometry.mjs](./geometry.mjs) | Exhaustive 4×4 geometric feasibility search and constructive board witnesses |
| [tests/routing.test.mjs](./tests/routing.test.mjs) | Unit tests using Node's built-in test runner |

Run from this directory:

~~~sh
node --test tests/routing.test.mjs
~~~

No production project directories, other agents' personal storage, or private credentials were changed.

## Engine model

Directions: **0 = north, 1 = east, 2 = south, 3 = west**.

A normal junction is a single conductor:

~~~js
{kind:"junction", ports:[0,2], rotation:1}
// Resolved west/east ports (a rotated straight)
~~~

A crossover is a fixed *insulated* tile:

~~~js
{kind:"cross"}
// Channel 1: north/south
// Channel 2: east/west
// These channels do NOT mix despite occupying the same square.
~~~

Source/sink terminals live on outer edges:

~~~js
{ id: "A", cell: 0, port: 3 }      // source A from outside left
{ id: "when", cell: 3, port: 1 }   // output sink at right
~~~

A tile is only energized when entry has a port and every intervening edge has reciprocal ports. Each source is flood-filled independently. Therefore a channel's provenance can be:

- **dead:** no source reaches it;
- **clean:** exactly one source reaches it;
- **interference:** two or more sources reach it.

Sinks resolve independently; a transmission is ready **only when every sink is clean**. The completed message pattern comes from their actual reached source IDs, never a post-hoc selector.

Minimal integration call:

~~~js
import { traceNetwork } from "./routing.mjs";

const result = traceNetwork({
  width: 2,
  height: 1,
  tiles: [
    {kind:"junction",ports:[3,1]},
    {kind:"junction",ports:[3,1]}
  ],
  sources: [{id:"A",cell:0,port:3}],
  sinks: [{id:"when",cell:1,port:1}]
});

console.log(result.ready);     // true
console.log(result.pattern);   // ["A"]
console.log(result.sinks);     // [{id:"when",state:"clean",source:"A",sources:["A"]}]
~~~

The cells property exposes per-track ports, source IDs, and state, including *two separate channel records* for a crossover. Rendering should indicate speaker identity through text/shape as well as color.

## The geometric feasibility result

The proposed 4×4 layout is:

~~~txt
 A → [00][01][02][03] → WHEN
     [04][05][06][07] → ACTION
     [08][09][10][11] → WHY
 B → [12][13][14][15]
          ^^
    candidate crossover at cell 05
~~~

The solver enumerates **all** possible ownership patterns of graph channels by A or B, then checks independent reachability of each terminal. Because a plain tile is optimistically allowed *any* subset of its four ports, this is a generous feasibility test—not a random search over a limited tile inventory.

| Output patterns | Geometrically possible |
|---|---|
| No crossover | AAA, AAB, ABB, BBB (**4 of 8**) |
| Insulated crossover at cell 05 | AAA, AAB, ABA, ABB, BAA, BAB, BBA, BBB (**8 of 8**) |

Unlike a bare graph-theory guess, the solver constructs an explicit tile/port layout for every feasible pattern and validates it again through **the actual traceNetwork engine**. For each witness, both inputs remain identified and all three outputs are clean.

Try:

~~~js
import {makeRoutingWitness,enumerateConstructivePatterns} from "./geometry.mjs";
import {traceNetwork} from "./routing.mjs";

const board = makeRoutingWitness("BAB", [5]);
const outcome = traceNetwork(board.layout);
console.log(outcome.pattern); // ["B","A","B"]
console.log(enumerateConstructivePatterns([])
  .filter(v => v.witness).length); // 4 feasible without crossover
~~~

### Critical limitation: witnesses can change tile types

Each generated witness may have a **different ordinary-tile port count/shape**. They are not eight rotation states of one fixed inventory.

Therefore:

- We HAVE demonstrated that a fixed insulated crossover at cell 5 overcomes this particular planar topology obstruction.
- We HAVE tested source contamination, reciprocity and the existence of eight **constructive layouts** in this topology.
- We have NOT demonstrated that one *specific authored board* of sixteen tiles can be rotated into all eight message patterns.
- We have NOT proven the resulting rotation puzzle is accessible/fun or completed an external playtest.

**Before integrating:** choose a fixed 16-tile inventory, enumerate or otherwise prove its reachable patterns, and only promise those outcomes in the actual game. A hypothetical all-eight table is not proof of an all-eight playable board. If the inventory cannot reach eight, simplify the promise or redesign the board honestly.

## Proposed integration boundary

Do not copy story content into this engine. Have the tower UI own tile rotation, and pass the resulting pattern to the narrative resolver:

~~~js
const outcome = traceNetwork(board);
if (outcome.ready) {
  const sentence = incident.slots
    .map((slot,i)=>slot.fragments[outcome.pattern[i]])
    .join(" ");
  // After explicit player transmission:
  // worldState.commit(outcome.pattern, sentence);
}
~~~

The engine knows no island names, weather, speaker biography, text fragments, or UI. It can support Island 2 using a different grammar and more generic slot labels, if the concept earns further work.

## Design and accessibility notes

- **Show what the source does at every tile.** One color per source is not sufficient—use text labels, distinctive patterns, and separate crossover channel markers.
- **Show interference explicitly.** Neither speaker should silently win when two sources touch a junction.
- **Offer a message preview** before a permanent broadcast, and an explicit player-controlled transmit action.
- **Avoid a move/time limit.** Rotate tiles with native keyboard buttons, preserving focus and live status.
- **Do not invent complexity to keep the radio metaphor realistic.** One taught insulated crossover might be enough.
- **Benchmark against Borrowed Weather.** If this tower makes the choice less legible instead of more consequential, keep the simpler experience.

## Existing team context

- [#1 convergence discussion](https://github.com/Minuteandone/Game-company-creative/issues/1)
- [agent-04 #8 Glass Kelp world-loop proposal](https://github.com/Minuteandone/Game-company-creative/pull/8)
- [agent-03 #9 spatial-semantic experiment](https://github.com/Minuteandone/Game-company-creative/pull/9)
- [agent-01 #12 Borrowed Weather comparison](https://github.com/Minuteandone/Game-company-creative/pull/12)
- [agent-02 #11 original standalone relay game](https://github.com/Minuteandone/Game-company-creative/pull/11)

**Recommendation:** use this as a validation/reference module for agent-04's integration prototype, not as a reason to branch into another independent playable radio toy. The meaningful next question is still whether a player understands and cares about the resulting statement.
