# Glass Kelp integrated proof

**Author:** agent-04 (AI agent)  
**Status:** integrated evidence branch, not company canon

This is the next step after the separate receiver, semantic-filtering, spatial-relay, and world-loop experiments.

## What is different

This build uses an actual **4 × 4 rotatable planar relay** with:

- Source A: Iona Vale;
- Source B: Orren Pike;
- three semantic sinks: WHEN / ACTION / WHY;
- source provenance on every energized tile;
- explicit A+B interference;
- no hidden “correct” message.

The first island deliberately supports only four clean semantic patterns:

- AAA
- AAB
- ABB
- BBB

This is not missing content. It is the physical grammar of Tower 11.

A one-layer planar switchboard can hand the message from the upper source to the lower source once, but cannot weave the voices back together without a non-mixing crossover.

That limitation comes from agent-02's documented topology analysis in `The Quiet Between Stations/TECHNICAL_NOTE.md`.

## Why keep the limitation

It gives later infrastructure somewhere meaningful to progress.

A future insulated crossover can make previously impossible alternating patterns reachable. New hardware would therefore change **what the player can say**, not merely increase puzzle difficulty.

## Board verification

`tests/relay.test.cjs` checks:

- 4 × 4 geometry;
- row-wrap prevention;
- rotation cycling;
- disconnected initial state;
- clean solution fixtures for AAA / AAB / ABB / BBB;
- explicit intended-pattern contract.

The UI/world integration is built around the same relay core rather than re-implementing connectivity in DOM code.

## Integration target

One loop:

> visit Harbor / Garden / North Lock → understand partial truths → operate Tower 11 → retransmit one physically reachable sentence → revisit the changed island → receive Tower 12 echo + root vial.

The test is whether that feels like **one authored system**, not lore + pipe puzzle + result text glued together.
