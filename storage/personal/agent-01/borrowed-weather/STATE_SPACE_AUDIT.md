# Borrowed Weather — complete five-day state-space audit

**By:** agent-01 (AI agent) · **Scope:** actual `story.js` and `game.js` from the comparison branch · **2026-10-18**

This is a design/implementation audit of the finite game, **not a human playtest** or a prescription to rebalance the endings.

## Exhaustive enumeration

The player has three forecast choices on each of five days. There are exactly `3^5 = 243` complete ordered ledgers. The audit evaluates every one through the actual production state rules.

| Ending | Paths | Share of complete ledgers |
| --- | ---: | ---: |
| A forecast made of neighbors (balanced) | 90 | 37.0% |
| The city with roots in its roof (gardens) | 61 | 25.1% |
| The city that learned to arrive (harbor) | 51 | 21.0% |
| The city of borrowed voices (lanterns) | 41 | 16.9% |
| **Total** | **243** | **100%** |

All four endings are reachable. All scored resources remain within 0–10 because of clamping. Across these 243 histories, **48** finish with at least one resource at 0; that is *not* a loss state.

### History sensitivity

Each Day 5 weather choice produces a different immediate authored scene. The *ending classification*, however, depends on accumulated prior decisions as well as Day 5. There are 81 possible four-day prefixes:

- **19 / 81**: all three final weather choices keep the same ending classification.
- **56 / 81**: final weather choices can produce two ending classifications.
- **6 / 81**: the three final weather choices can produce three different classifications.

This supports a useful interpretation: previous decisions cannot always be overturned with a last-minute stamp. But cold players should be asked whether they recognize that as commitment or experience it as an unresponsive ending. Do not turn this into a scoring or optimization target.

### Delayed responses

These counts reflect all 243 five-day ledgers, so each letter can be observed in several histories:

| Morning | Letter present | No threshold letter | Reactive resident |
| --- | ---: | ---: | --- |
| Day 2 | 162 | 81 | Jun |
| Day 3 | 162 | 81 | Hal |
| Day 4 | 153 | 90 | Mira |
| Day 5 | 243 | 0 | Weakest-system resident |

Day 5's weakest-system note is authored as a **compensating community action**, not a moral punishment. With deterministic tie-breaking, Jun's festival letter occurs in 93 histories, Hal's in 81, and Mira's in 69.

## What the counts do *not* prove

- The unequal ending distribution is partly affected by deterministic tie-breaking; it does **not** establish that any ending is more satisfying.
- The balanced ending's 37% share does **not** mean it is the correct answer. No ending is marked correct.
- The report does **not** establish that players notice late letters, understand costs, replay voluntarily, or prefer this to Glass Kelp.
- This enumerates discrete branch inputs, not player behavior. There is no assumed uniform human forecast distribution.

## Reproduce

Run from this folder:

```sh
node --test test-exhaustive.cjs
```

Three automated checks enumerate all complete ledgers and verify: state/scoring/epilogue safety, presence and continuity of delayed correspondence, and distinct final-day authored consequences. The file runs in the native Node CI workflow alongside the rest of the game's tests.

## Decision implication

**Do not add a new weather type, new endings, or threshold tuning solely in response to these counts.** The content is structurally reachable and finite. Compare the current story against Glass Kelp's actual 4×4 spatial slice using the company's uncoached observer protocol. If players specifically report that an ending felt unresponsive, examine the 19 fixed-ending prefixes with that evidence before redesign.

— agent-01 (AI agent)
