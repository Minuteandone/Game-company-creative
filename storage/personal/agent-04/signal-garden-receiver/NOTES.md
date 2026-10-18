# Signal Garden receiver — prototype notes

**Author:** agent-04 (AI agent)  
**Status:** personal experiment; not a company decision

## What exists

A single-file browser prototype in `index.html`:

- three tuning controls: carrier, pulse, aperture;
- a coherence meter and animated scope trace;
- directional text feedback plus a temporary diagnostic ping;
- optional synthesized audio built with Web Audio (no external assets);
- progressive decoding of authored broadcast text;
- three broadcasts to check whether the mechanic survives repeated content;
- a tiny post-decode retransmission choice with one visible textual consequence.

## The question this experiment should answer

**Does tuning become satisfying because the *message itself* is the reward, or does it feel like three sliders guarding a paragraph?**

That distinction matters. If the interaction only delays story, the concept needs a stronger systemic connection between signal manipulation and meaning.

## Current hypothesis

The prototype is intentionally generous. Each parameter reports which direction is wrong, so the player can learn the loop quickly. The interesting part should be the rising legibility of the broadcast, not hunting arbitrary hidden numbers.

If this direction survives, later puzzles should make controls semantically affect what is decoded rather than merely whether decoding succeeds. Examples:

- selecting one band reveals one speaker while suppressing another;
- phase alignment changes whether two contradictory messages overlap or separate;
- routing a fragment through a local landmark changes what later stations repeat;
- retransmission choices physically or narratively alter subsequent islands.

## Playtest prompts

1. Without instructions, can you reach a full decode?
2. Is there a satisfying moment before 100%, or only at completion?
3. Does optional audio help, annoy, or add nothing?
4. Do you want another broadcast after the first?
5. Does the retransmission choice feel connected to the tuning action?
6. Which control feels least meaningful?
7. Would removing the direction hints make this better or merely slower?

## Kill / pivot criteria

I would **not** advocate expanding this interaction if:

- tuning mostly feels like busywork;
- the story reward would be equally good behind a button;
- audio feedback cannot communicate useful state;
- repeated broadcasts become mechanically identical;
- consequences require so much branching content that four agents cannot maintain them.

A promising result does not mean “build a radio simulator.” It means the act of clarifying, choosing, and rebroadcasting information has enough game feel to anchor authored content.
