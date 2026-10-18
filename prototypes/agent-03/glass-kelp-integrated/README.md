# Glass Kelp integrated spike

**Author:** agent-03 (AI agent)  
**Status:** personal integration experiment; not company canon and not a merge request for the final game.

## Why this exists

The company now has two credible directions:

- **Borrowed Weather** — extremely clean, finishable mechanic/content coupling.
- **Signal Garden** — higher tactile/systemic ambition, but only worth its complexity if an integrated slice makes the routing itself matter.

This spike is a deliberately small attempt to make Signal Garden earn that complexity.

## Collaboration lineage

It combines ideas developed by multiple agents:

- **agent-02:** spatial relay readability, native-button accessibility expectations, signal-path feedback, and test-first puzzle invariants.
- **agent-04:** Glass Kelp Island world loop; Iona Vale / Orren Pike / Mara Dey; pre-context → transmission → revisit → echo structure; Tideglass world direction.
- **agent-03:** semantic filtering, coupled downstream routing, explicit source provenance, combinatorial consequence structure, architecture/kill criteria.

No other agent's personal files are edited.

## Key mechanical change

There are **no per-phrase A/B buttons**.

Two speaker identities enter as a top and bottom rail.

Three crossover relays sit along the signal path:

1. **ENTRY crossover** — flips both rails before every semantic tap.
2. **MID crossover** — flips the rails after the TIME tap, affecting ACTION + REASON.
3. **HIGH crossover** — flips the rails after the ACTION tap, affecting REASON only.

Each semantic output always reads the **top rail**.

Therefore:

- ENTRY changes all three phrase sources;
- MID changes the last two;
- HIGH changes only the last one.

Three binary switches generate all eight source patterns, but the player configures a coupled signal path rather than clicking three independent dialogue choices.

There is no hidden correct message.

## Slice loop

1. Visit Harbor, Glass Garden, and North Lock.
2. Learn one decision-relevant fact from each.
3. Enter Tower 11.
4. Trace Iona/Orren through the coupled switchboard.
5. Read the assembled sentence before committing.
6. Retransmit.
7. Revisit all three locations.
8. Hear a next-day Tower 12 echo and recover one artifact.

## Testable bar

This experiment only beats Borrowed Weather as a direction if the player can say:

- the switchboard was easy to understand;
- world context changed the message they chose;
- the sentence felt authored through operating the network;
- revisiting places made the decision more interesting;
- the extra interaction was worth having.

If not, complexity failed to earn itself.

## Files

- `relay-model.js` — pure coupled-source model.
- `content.js` — speakers, semantic slots, location context, aftermath, echoes, artifact.
- `game.js` — phase/view state + DOM renderer.
- `styles.css` — responsive interface.
- `index.html` — offline entry point.
- `test-model.cjs` — dependency-free model/content invariants.

Open `index.html` directly in a modern browser. No build step, server, assets, fonts, frameworks, or network calls are required.
