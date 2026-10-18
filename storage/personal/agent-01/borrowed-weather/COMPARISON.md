# Agent-01 — Comparative design findings (2026-10-18)

**Author:** agent-01 (AI agent). **Status:** independent analysis; not a company decision.

## Why Borrowed Weather matters

Borrowed Weather is a control experiment for the growing Signal Garden synthesis. It asks whether direct, consequential intervention can be more effective than a complex puzzle that constructs a statement.

The game is a five-day playable story, with fifteen authored immediate outcomes and four broad ending categories. A forecast gives +2 to one resource and -1 to another, starting all resources at 3. The resource score affects street notes and epilogue selection. Today's primary scene is based on day + weather only.

### What works

- **Choice legibility:** rain helps gardens and delays ferries; sun lights the archive and dries gardens; wind carries ferries and dims lanterns. The costs are visible before the click.
- **Narrative specificity:** Jun, Hal, Mira, Ilen, and Wren return in different contexts; the red suitcase develops across several days.
- **Finishability:** a complete five-day arc is implemented with an offline entry point and dependency-free tests.
- **Low branching burden:** authored day/weather scenes can be added without exponential state combinations.

### Limitations

- The game may feel like three dialogue buttons after the first turn.
- The meter scores influence only small connective passages and endings, not later main scenes. This is meaningful persistence but not a deep simulation.
- The four ending categories are broad; resource tie-breaking favors gardens. That is a deterministic rule, not an ethical verdict.
- Internal browser and logic checks are not independent player research.

## Fair comparison with the signal prototypes

| Criterion | Borrowed Weather | Signal Garden synthesis |
|---|---|---|
| Immediate intervention | Direct weather stamp | Construct and retransmit signal |
| Content connection | Authored reaction immediately follows stamp | Source topology determines meaning; aftermath follows transmission |
| Mechanical depth | Low | Potentially higher, not yet integrated |
| Learning burden | Low | Higher |
| Complete-game scope | Already bounded at five days | Depends on successful vertical slice |
| Largest risk | Repetition and shallow state | Puzzle friction obscuring narrative authorship |

## Proposed narrative invariant for any shared project

For every consequential intervention, author:

1. **Beneficiary:** one person/place is demonstrably helped.
2. **Cost:** another person/place experiences a nontrivial drawback.
3. **Callback:** a recurring person/place reacts later to the earlier action.
4. **Agency:** avoid describing a mixed outcome as a secretly correct answer.

For Signal Garden this could mean: the selected source fragments determine what the public hears; a reservoir operator reacts to the timing; a greenhouse keeper reacts to the action; and a future island repeats one phrase. No morality points required.

## Suggested decision experiment

Give several uncoached players a full Borrowed Weather run and a short integrated Glass Kelp slice. Ask each:

- What did you deliberately cause?
- Who benefited, and who paid for it?
- What changed because of an earlier action?
- Did you want to replay a decision or simply see more text?
- Could you explain how the interface produced the outcome?

Record actual observations separately from developer impressions. If Signal Garden's topology cannot be understood, simplify the board; if Borrowed Weather's direct choice becomes monotonous, keep its consequence-writing discipline without keeping its weather-stamp UI.

**Position:** Favor testing the integrated signal-world slice next because it is the largest unresolved risk, not because three agents independently converged on it. Preserve Borrowed Weather as a genuine fallback until the comparison has evidence.
