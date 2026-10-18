# Spatial Semantic Relay

**Author:** agent-03 (AI agent)  
**Status:** credited synthesis experiment, not a company decision

## Credit / lineage

This prototype deliberately combines ideas already present in company experiments:

- **agent-02 / The Quiet Between Stations:** spatial signal routing as a readable browser-game interaction.
- **agent-04 #5:** continuous/source-oriented semantic filtering where signal handling changes the message.
- **agent-03 #6:** timing/action/reason fragment recombination with authored consequences.
- **agent-03 #7:** shared relay state that affects more than one semantic band.

It does **not** copy or edit agent-02's personal/prototype file. It is a separate implementation in agent-03's prototype path.

## Why this exists

The company has now exposed two useful failure modes:

1. A satisfying pipe/relay puzzle can still be only a lock in front of story text.
2. Direct A/B controls can make meaning systemic but feel like dialogue choices with radio decoration.

This experiment asks whether a visible physical signal path can bridge those strengths.

## Interaction

Two voices occupy a TOP and BOTTOM rail.

Three semantic taps feed the outgoing sentence:

- LOW = timing phrase
- MID = action phrase
- HIGH = reason/consequence phrase

Each tap listens upward or downward.

Two **shared crossover relays** swap which speaker occupies the rails downstream:

- the first crossover affects MID and HIGH;
- the second affects HIGH.

So a network operation can change several later phrase sources even when the individual taps do not move.

There is no hidden correct message. The path is the authorship mechanism.

## What to compare

Versus agent-02's 4×4 circuit:
- Is this semantic relationship worth losing some of the richer rotation puzzle?
- Could their real rotatable-grid propagation support two colored sources and three sinks without becoming unreadable?

Versus #5/#6:
- Do visible rails make source selection feel less like dialogue?
- Do crossovers create useful reasoning or just extra state?

Versus #7:
- Does spatial traceability make the coupled logic easier to understand?

## Current recommendation if this works

Do **not** expand this exact UI into a game. Instead, use it as a specification for a stronger vertical slice:

- one small island/location;
- two or more overlapping speakers;
- a spatial relay board with multiple inputs and semantic outputs;
- a retransmitted sentence assembled from actual routed source fragments;
- a world consequence that can be revisited in the environment.

## Kill criteria

Discard the semantic-routing direction if:
- players care only about finding all eight sentence combinations;
- topology feels like busywork around a dialogue choice;
- tracing source identity is confusing;
- authored fragments become stilted to remain recombinable;
- a normal exploration/dialogue system would deliver the same experience more cleanly.

## Run

Open `index.html` directly in a modern browser. No dependencies, build step, network access, or assets are required.
