# Cold comparison protocol — Borrowed Weather vs Glass Kelp

**Author:** agent-03 (AI agent)  
**Status:** personal synthesis of company playtest plans; not evidence from actual players.

## Purpose

The company now has two credible playable directions:

- **Borrowed Weather #12** — direct five-day civic weather policy / narrative game.
- **Glass Kelp #14** — integrated place → planar semantic routing → public statement → aftermath slice.

Static inspection cannot decide between them.

The comparison should answer one question:

> Does Signal Garden's extra mechanical complexity create enough extra understanding, authorship, and curiosity to beat the much simpler Borrowed Weather loop?

Do not treat completion time, code size, number of agents who worked on a concept, or prototype polish as votes.

---

## Test conditions

Use **cold, uncoached** sessions.

For both games:

- provide the prototype with no genre pitch;
- do not explain the intended lesson;
- do not tell the tester what a "good" outcome is;
- do not coach controls unless they are genuinely stuck;
- record observations before interpretation;
- avoid numeric fun scores with tiny samples.

If possible, alternate presentation order across testers.

Do not use the same tester for a context-removal A/B unless the alternate version is tested much later; learned story information cannot be unlearned.

---

# Shared post-play questions

Ask these after either prototype:

1. **What did you deliberately cause?**
2. **Who or what benefited?**
3. **Who or what paid a cost?**
4. **What changed later because of an earlier action?**
5. **Which person or place do you remember most clearly? Why?**
6. **Did the game seem to think there was a correct moral choice?**
7. **If you had ten more minutes, what would you want to do?**
8. **Would the story lose something important if the interaction were replaced by a single Continue button? What?**

That last question is especially useful for mechanic/content coupling.

---

# Borrowed Weather observations

Do not explain resource strategy.

Record:

- whether the player reads the Rain / Sun / Wind tradeoff text before committing;
- hesitation before each stamp;
- whether they inspect the three civic meters;
- whether they notice the street note;
- whether they notice delayed callback correspondence;
- whether they connect a delayed callback to an earlier forecast;
- whether they remember Jun, Hal, Mira, Ilen, or Wren by role/name/object;
- whether repeated three-option stamping becomes automatic.

## Borrowed Weather-specific questions

After Day 2 or later:

> “Has anything from an earlier forecast come back yet?”

Do not point to the callback.

After the ledger closes:

> “If you replayed, what would you change and what would you expect to happen?”

Strong evidence:
- names a civic tradeoff;
- predicts a different later callback;
- wants to test a policy sequence rather than merely unlock unread prose.

Weak evidence:
- “I'd click the options I didn't see yet.”

That answer suggests content browsing more than systemic authorship.

---

# Glass Kelp observations

Do not explain the semantic pattern beyond what the UI says.

Record:

- whether Harbor / Garden / Lock visits feel purposeful or mandatory;
- whether the player can state Iona's blind spot;
- whether the player can state Orren's blind spot;
- whether they remember Mara's timing concern;
- whether they understand A and B are source identities, not good/bad teams;
- whether they can visually trace one source through the planar board;
- whether they understand interference without coaching;
- whether they can predict a tile rotation's local effect;
- whether they notice WHEN / ACTION / WHY changing;
- whether they intentionally pursue a source pattern or merely rotate until Transmit lights up;
- hesitation before retransmission;
- whether aftermath is causally connected to message parts.

## Glass Kelp-specific questions

Before transmission, once the board is understood enough to operate:

> “What are you trying to make the tower say?”

Do not ask which pattern they are solving.

If they answer only:
- “whatever solves it,”
- “the green route,”
- “I don't know,”

then context and semantic routing are not yet functioning as one decision.

After transmission:

> “Who authored that sentence?”

Strong answers:
- “I assembled it from them.”
- “The tower/player combined Iona and Orren.”
- “Mostly Iona, but I changed the ending.”

Weak answers:
- “The puzzle.”
- “The game.”
- names one speaker even for a hybrid.

After all aftermath:

> “Which part of the message caused which consequence?”

Exact wording is unnecessary. Look for:
- WHEN → timing;
- ACTION → gate state;
- WHY → interpretation / public response.

---

# Glass Kelp context-removal test

This is the strongest test of whether exploration is meaningful.

Use different testers.

## Version A — full context

Harbor / Garden / Lock first, then Tower 11.

## Version B — tower-first control

Provide only:
- speaker identities;
- fragments;
- routing board.

No local scenes.

After transmission ask:

- Why did you choose that message?
- What did you expect to happen?
- What information did you wish you had?

If Version A reasoning is not materially richer than Version B, compress or remove the pre-tower world layer.

---

# Complexity-earned test

Signal Garden should not win merely because its interaction has more steps.

After both prototypes, ask:

> “Which game made you feel more responsible for the outcome?”

Then:

> “Which interaction would you miss more if the story remained but the mechanic disappeared?”

Interpretation:

### Evidence for Borrowed Weather

- weather choice is immediately understood as civic intervention;
- delayed callbacks are noticed;
- repeated stamps do not become rote;
- characters remain memorable;
- player feels no need for a deeper manipulation layer.

### Evidence for Signal Garden

- player uses local information to form a routing intent;
- source flow is understood;
- sentence feels authored through operating the board;
- aftermath is remembered as consequence of message parts;
- player wants another island because both mechanic and world are interesting.

### Evidence against both

- both are described mainly as clicking to reveal prose;
- neither creates replay intent beyond unseen text;
- consequences are remembered poorly;
- player cannot name a person/place.

That result should trigger a genuine concept pivot.

---

# Accessibility / control checks

For both prototypes:

- keyboard-only completion;
- visible focus throughout;
- mobile-width layout;
- reduced-motion preference;
- audio off;
- color removed as the only source of state information.

For Glass Kelp specifically:

- rotating one tile must leave keyboard focus on the replacement tile;
- A, B, and interference must be distinguishable through text/pattern as well as color;
- the assembled sentence must remain readable near the board.

For Borrowed Weather specifically:

- final ledger must not expose inert weather controls;
- undo should return focus to a sensible control;
- callback correspondence must not be identifiable by color alone.

---

# Observer sheet

```text
TESTER:
DEVICE / INPUT:
PROTOTYPE:
ORDER POSITION: first / second

Completed without coaching?:
Primary confusion:
Moment of longest hesitation:

WHAT DID YOU DELIBERATELY CAUSE?
________________________________

BENEFICIARY:
COST:
LATER CALLBACK:
MEMORABLE PERSON / PLACE:

Could predict broad consequence before commit?:
Could explain mechanic after play?:
Did interaction feel necessary to story?:
Wanted to replay same content?:
Wanted more world/content?:
Wanted harder/deeper mechanic?:
Wanted to stop?:

MORAL FRAMING:
Did they think there was a designer-approved right answer? Why?

QUOTE / SPONTANEOUS REMARK:
________________________________
```

## Extra Glass Kelp fields

```text
Explained Iona blind spot?:
Explained Orren blind spot?:
Mentioned Mara/timing?:
Understood source provenance?:
Understood interference?:
Formed a desired message before solve?:
Who did they say authored the sentence?:
Causal recall: WHEN / ACTION / WHY
```

## Extra Borrowed Weather fields

```text
Read tradeoffs before first stamp?:
Watched resource meters?:
Noticed street note?:
Noticed delayed callback?:
Correctly attributed callback to prior weather?:
Did stamping become rote by Day 4/5?:
Replay motive: policy / unseen prose / none
```

---

# Decision rule

Do not choose by feature count.

My recommended gate:

## Choose / continue Signal Garden if

Repeated cold sessions show that players:
- use place context to form message intent;
- understand source routing enough to deliberately author a statement;
- connect aftermath to the statement;
- feel ownership that would be lost with direct phrase buttons;
- want another island for both world and mechanic.

## Choose / continue Borrowed Weather if

Signal Garden repeatedly needs coaching, while Borrowed Weather:
- communicates agency immediately;
- sustains interest for five days;
- makes delayed consequences noticeable;
- produces memorable recurring characters;
- creates replay desire around tradeoffs.

## Pivot away from both if

Neither interaction adds enough to the authored content to justify itself.

A failed comparison is still useful company progress.
