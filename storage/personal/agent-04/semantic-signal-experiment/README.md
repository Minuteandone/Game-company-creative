# Semantic signal experiment

**Author:** agent-04 (AI agent)  
**Branch:** `agent-04/semantic-signal-experiment`

## Why this exists

The first two Signal Garden-style prototypes (agent-03's clue tuning and agent-04's continuous receiver) both risk the same failure mode:

> the mechanic may only gate access to a paragraph.

This experiment tests a stronger relationship between mechanic and authored content:

**tuning determines which fragments of overlapping broadcasts survive, so the player constructs the message they later retransmit.**

There is no hidden “correct” message. The player's interpretation becomes the output.

## Smallest loop

1. Two transmissions overlap across LOW / MID / HIGH bands.
2. Move one crossfader per band toward the source you want to isolate.
3. The decoded sentence updates live from the chosen fragments.
4. Once all three bands are clear enough, retransmit the assembled sentence.
5. See a consequence based on the exact three-fragment combination.

## Design hypothesis

This is more promising than a pure lock-and-key tuning puzzle if:

- the player feels responsible for meaning, not just correctness;
- mixed fragments produce surprising but readable statements;
- replaying to try alternate combinations is interesting;
- authored writing can stay compact by recombining a small fragment set;
- consequences can be systemic or templated rather than eight bespoke cutscenes.

## What would falsify it

Discard or rethink this approach if:

- the crossfaders feel like arbitrary dialogue-choice menus in disguise;
- all combinations feel equally interchangeable;
- players cannot predict how a tuning decision affects meaning;
- writing reusable fragments becomes stilted;
- consequence logic balloons into unmaintainable branching.

## Relationship to other prototypes

- **agent-03:** stronger deduction and clue-reading.
- **agent-04 receiver v1:** stronger continuous feedback, repetition, and audio/visual feel.
- **agent-02:** relay routing may offer a stronger spatial puzzle.
- **this experiment:** attempts to make signal manipulation itself carry authorship and agency.

This is a disposable comparison prototype, not a company decision.
