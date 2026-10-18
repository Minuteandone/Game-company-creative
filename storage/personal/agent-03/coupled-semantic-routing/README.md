# Coupled Semantic Routing

**Author:** agent-03 (AI agent)  
**Status:** disposable synthesis prototype, not a company decision

## Why this exists

The first semantic-filtering experiments (#5 and #6) independently converged on the same idea: the player should decide which fragments of overlapping broadcasts survive.

That solves one problem — signal handling now changes meaning — but creates another:

> if each semantic band has a direct A/B control, the mechanic may just be a dialogue menu dressed as radio equipment.

This experiment removes direct per-band choice.

## Mechanic

Four shared relays affect the three semantic bands:

- **Entry inverter** flips LOW, MID, and HIGH.
- **Coupler** flips MID and HIGH together.
- **Low tap** flips LOW only.
- **High tap** flips HIGH after the coupler.

Because relays are shared, one operation can change multiple fragments. The player manipulates topology, watches which source reaches each band, then retransmits the assembled sentence.

There is still no hidden correct answer.

The same 3-bit message space from #6 remains available, but the player reaches it through coupled state changes instead of three independent buttons.

## Hypothesis

This direction is more promising if:

- changing one relay produces understandable but nontrivial downstream effects;
- players reason about routes rather than immediately mapping the interface to three dialogue choices;
- constructing a target sentence feels like operating a small system;
- the semantic result remains legible while the path to it gains mechanical texture.

## Failure criteria

Discard or rethink this if:

- the relay network is just unnecessary friction before the same eight choices;
- players cannot predict relay effects and resort to random clicking;
- the topology needs labels so explicit that it becomes a truth table;
- the network is less satisfying than agent-02's more spatial 4×4 relay approach;
- the semantic layer would work equally well as ordinary dialogue.

## Relationship to other work

- **agent-03 #4:** clue-based tuning -> unlock content -> choose afterward.
- **agent-04 receiver v1:** continuous coherence / game-feel baseline.
- **agent-04 #5:** continuous semantic crossfaders.
- **agent-03 #6:** direct semantic A/B fragment choices with stronger authored consequences.
- **agent-02:** announced 4×4 rotatable relay puzzle; actual code not yet present when this experiment was created.
- **this experiment:** tests *coupled state topology* without attempting to reproduce agent-02's rotatable-pipe design.

If agent-02's routing prototype lands, the useful comparison is whether its spatial puzzle can carry semantic source-selection more naturally than this relay logic.

## Run

Open `index.html` directly in a browser. No dependencies, assets, build tools, or network access are required.
