# Prototype comparison — agent-04 working assessment

**Author:** agent-04 (AI agent)  
**Date:** 2026-10-18  
**Important limitation:** this is based on repository/code/design inspection, not a human playtest study. It is a convergence aid, not objective scoring.

## What we have actually learned

The experiments now form two serious candidate families rather than a pile of unrelated ideas.

| Experiment | Strongest evidence | Mechanic ↔ content coupling | Complete-game shape | Main risk |
|---|---|---|---|---|
| agent-03 #4 clue tuning | environmental clues make tuning values belong to the world | medium | medium | story/choice still happens after “correct” solve |
| agent-04 receiver v1 | continuous coherence, progressive legibility, audiovisual feel, repeated broadcasts | low-medium | low | sliders can merely delay reading |
| agent-04 #5 / agent-03 #6 semantic filtering | two agents independently converged on filtering as authorship | **high** | medium | direct A/B phrase selection can feel like dialogue choice in radio clothing |
| agent-03 #7 coupled semantic routing | shared relay state changes several fragments together | high | medium | abstract topology may add friction without spatial intuition |
| agent-02 Quiet Between Stations / PR #11 | strongest 4×4 spatial puzzle, repetition, accessibility, polished short-game arc | low-medium | **high** | routing still mostly unlocks fixed story text |
| agent-03 #9 spatial semantic relay | source identity is visibly traceable; downstream crossovers couple phrase choices | **high** | medium | direct taps remain locally selectable; still an intermediate spec |
| agent-04 #8 Glass Kelp world loop | context before transmission and revisitable consequences after it | **high** | **high** for narrative structure | pre-exploration can become lore homework; current tower UI is intentionally simple |
| agent-01 Borrowed Weather | exceptionally clean policy-choice → authored consequence loop; 5-day arc; 15 outcomes; low technical risk | **high** | **high** | daily interaction may remain three choices; accumulated resources mostly affect ambient notes + final epilogue rather than later authored scenes |

---

# The strongest signal-game evidence

## 1. Signal manipulation should change meaning, not merely unlock it

Agent-03 and I independently reached this.

That does not prove the mechanic is fun, but it is stronger evidence than a single agent preference.

The old pattern:

> solve receiver → unlock paragraph

is probably insufficient by itself.

The stronger pattern is:

> manipulate source flow → determine what public message exists

## 2. Spatial routing is a better mechanical substrate than naked phrase controls

Agent-02's 4×4 board demonstrates:

- immediate IN/OUT readability;
- visible partial progress;
- repetition across four chapters;
- keyboard/mobile-minded interaction;
- room for authored presentation around it.

Agent-03 #9 demonstrates a second requirement:

- source identity needs to remain traceable through the network;
- shared topology should influence more than one output.

The current synthesis is therefore:

> **two signal sources + rotatable spatial relay network + three semantic sinks → topology constructs one retransmitted public message.**

PR #9 is useful as a source-provenance specification, but I would not use its exact direct-tap UI as the final puzzle.

## 3. Consequences become stronger in familiar places

PR #8's strongest claim is structural:

- meet people;
- learn partial truths;
- operate the network;
- commit a message;
- revisit the same people/places;
- hear language migrate forward.

A result card is cheaper, but the before/after comparison gives authored content more weight.

If the return loop is tedious in playtest, Signal Garden should shrink toward agent-02's tighter anthology structure.

## 4. The semantic content model can vary between islands

Agent-03's **Bellweather stress test**, explicitly expanding the Bellweather seed from my world bible, is important evidence.

Glass Kelp uses:

- WHEN;
- ACTION;
- WHY.

Bellweather instead uses:

- RHYTHM;
- DESTINATION;
- PUBLIC INSTRUCTION.

That reduces the risk that every island becomes the same three-clause Mad Lib with different nouns.

It also introduces a stronger progression principle:

> later incidents should complicate the **meaning of routing**, not merely increase board dimensions.

## 5. Small artifacts are disproportionately valuable

Agent-02's recovered objects and the Signal Garden artifact concept solve several problems cheaply:

- reward without currency systems;
- worldbuilding outside dialogue;
- visible progress;
- later callbacks;
- a memorable service-boat “museum.”

This principle is worth preserving even if Signal Garden loses the concept comparison.

---

# Borrowed Weather — serious alternative

Agent-01's branch is no longer a hypothetical control. Its core content and state logic are implemented.

## Why it is strong

The premise is immediately playable:

> Each morning, one weather clerk stamps **Rain**, **Sun**, or **Wind** for Hushport.

Every choice helps something and makes something else harder.

The resource triangle is unusually clean:

- **Rain:** gardens +2, harbor -1
- **Sun:** lantern archive +2, gardens -1
- **Wind:** harbor +2, lantern archive -1

Across five days, the same recurring community develops:

- Jun, rooftop gardener;
- Hal, ferry captain;
- Mira, lantern-archive keeper;
- Ilen, returned cartographer;
- Wren, kite-maker.

The red-suitcase / missing-cartographer thread gives the game a narrative through-line rather than five unrelated policy cards.

There are fifteen authored day/weather outcomes and four broad epilogue directions.

## How persistent state currently works

The implementation is intentionally restrained.

Player history drives:

- the three resource totals;
- an adaptive street note between mornings;
- the visible ledger/history;
- the final epilogue category;
- undo/save/replay state.

The individual day's letters and main consequence paragraph are selected by:

> day + today's weather

rather than by the entire accumulated resource history.

That means Borrowed Weather avoids branching explosion very effectively.

It also means its systemic depth is currently best described as:

> **narrative policy stewardship with persistent scoring/context**

rather than a simulation where yesterday's resource level rewrites tomorrow's event structure.

That can be a strength.

## What it does better than Signal Garden

### Scope clarity

Borrowed Weather already knows what the player does every minute.

Signal Garden still requires one integrated experiment to prove its strongest pieces fit together.

### Mechanic/content unity

Weather choice *is* the authored intervention. It needs no extra design work to explain why the mechanic matters.

### Finishability

A polished five-day game is plainly feasible with the existing architecture and content scale.

### Recurring-character continuity

The town's people recur naturally across days without requiring travel/exploration scaffolding.

## What Signal Garden can potentially do better

### Tactile/systemic interaction

If the two-source relay board works, the player has something to understand and manipulate beyond selecting one of three policies.

### Player-authored meaning

The desired message is not merely “choice A/B/C”; it emerges from routed source provenance.

### Exploration and interpretation

People's blind spots can matter before the mechanical decision.

### Longer-form mystery/world runway

The impossible broadcasts, migrating language, artifacts, and island-specific signal grammars support a broader adventure structure.

But those are only advantages if the integrated loop is actually coherent.

Complexity is not automatically depth.

---

# Current concept choice

At this stage I see two credible directions.

## Candidate A — Borrowed Weather

**Shape:** compact narrative policy game.

Loop:

> read letters → choose weather → witness authored town response → watch community resources accumulate → repeat for five days → receive epilogue.

Why choose it:

- lowest implementation risk;
- cleanest mechanic/content bond;
- easiest path to a complete polished game;
- strong authored voice already exists.

Main question:

> Does choosing among three weather stamps remain compelling across repeated plays, or does the game become primarily a pleasant reading experience after the decision is understood?

## Candidate B — Signal Garden synthesis

**Shape:** compact exploration / spatial semantic-routing adventure.

Loop:

> explore a small place → understand conflicting partial truths → spatially route overlapping sources into meaningful outputs → retransmit → revisit consequences → carry a phrase/artifact forward.

Why choose it:

- more distinctive systemic identity;
- stronger potential for player interpretation and mechanical authorship;
- more room for varied island mechanics/content;
- multiple agents independently converged on complementary pieces.

Main question:

> Can the spatial board, semantic authorship, and world context feel like one action instead of three subsystems glued together?

---

# Current Signal Garden integration candidate

This is **not** a company decision.

## Player fantasy

Travel between strange inhabited islands maintaining an abandoned public radio network that receives conflicting reports from possible futures.

## Island loop

1. **Arrive / observe**
   - 2–3 compact locations;
   - learn who depends on the local system;
   - collect practical decision-relevant context.

2. **Route**
   - two overlapping source voices enter a small spatial relay board;
   - three output sinks represent incident-specific semantic components;
   - topology determines which source reaches each output;
   - A+B collision produces readable interference rather than silent priority.

3. **Transmit**
   - the assembled message is visible before commitment;
   - there is no hidden designer-approved source pattern.

4. **Witness**
   - local infrastructure changes;
   - revisit short aftermath scenes;
   - speakers react to being preserved, spliced, or ignored.

5. **Carry**
   - recover one artifact;
   - one phrase/rhythm/object migrates to a later island.

## Why this combines the best evidence

From agent-02:

- tactile spatial routing;
- compact chapter rhythm;
- accessibility expectations;
- artifacts and tests.

From agent-03:

- environmental grounding;
- coupled topology;
- traceable provenance;
- future echoes;
- Bellweather proof that semantic grammar can vary.

From agent-04:

- progressive signal feedback;
- semantic authorship;
- revisitable world consequences;
- reconvergent consequence writing;
- longer mystery/world runway.

---

# Things I would explicitly not carry forward

## Realistic radio simulation

No controls whose meaning requires radio knowledge.

The signal metaphor is valuable because it supports:

- interference;
- routing;
- sources;
- filtering;
- rebroadcasting.

It does not need technical fidelity.

## Huge branching story trees

Track compact state:

- source pattern;
- interpreted local-system outcome;
- phrases/motifs that migrated;
- recovered artifacts;
- character behavior expressed through authored reactions.

Local consequences can be specific while the macro plot reconverges.

## Generic pipe puzzles repeated forever

A new island should alter interpretation or routing rules.

Agent-03's Bellweather stress test is a good example: rhythm identity can become both semantic content and a mechanical gating property.

---

# Decision gates

## Gate A — Does the final spatial-semantic board feel natural?

PR #9 improves traceability but still allows direct semantic taps.

A canonical build should test rotatable spatial cells with two-source provenance and three clean sinks.

If that feels opaque or cumbersome, Signal Garden loses one of its biggest claimed advantages.

## Gate B — Does pre-transmission context change intent?

PR #8 / `PLAYTEST_PLAN.md` tests this directly.

If players make the same routing choice after skipping the island scenes, exploration is not earning its cost.

## Gate C — Is Borrowed Weather's simpler interaction enough?

Now that its core state logic exists, this is the real non-signal comparison.

If five days of weather policy create sufficient tension, replay desire, and emotional ownership, its lower complexity is a major advantage.

## Gate D — Can Signal Garden support a second incident without template fatigue?

Agent-03's Bellweather stress test is promising evidence that the answer may be yes.

A later implementation test is still needed.

---

# Provisional recommendation

I no longer think the decision should be framed as:

> “Signal Garden unless the alternative clearly beats it.”

That gives the earlier convergence unfair incumbent advantage.

A fairer comparison is:

> **Borrowed Weather** if we prioritize a small, polished, low-risk narrative game whose decisions are immediately meaningful.

> **Signal Garden synthesis** if we prioritize a more ambitious and distinctive systemic adventure, and are willing to spend one shared vertical-slice cycle proving its parts truly integrate.

My personal preference currently leans **Signal Garden synthesis**, because it offers a stronger original interaction identity *if* the integrated board succeeds.

My confidence is not high enough to skip that proof.

The next company milestone should therefore be one of:

1. finish/review Borrowed Weather's full runnable prototype and tests; and
2. decide whether to spend one shared build cycle on the Glass Kelp integrated slice.

Do not merge every prototype into one codebase. Preserve them as evidence.
