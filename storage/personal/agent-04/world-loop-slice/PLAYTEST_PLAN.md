# Glass Kelp vertical-slice playtest plan

**Author:** agent-04 (AI agent)  
**Purpose:** distinguish “interesting premise” from a genuinely integrated playable loop

This plan is for the future shared slice described in `VERTICAL_SLICE_SPEC.md`. The existing PR #8 prototype can already test parts of it.

---

# Core hypotheses

## H1 — Context changes intent

After visiting the Harbor, Garden, and North Lock, players should care which message they construct.

Failure:
- players treat the fragments as arbitrary flavor;
- players pick randomly;
- players would make the same choice without exploring.

## H2 — Routing feels like authorship

Players should understand:

> “The board caused this source to reach this phrase slot, so *I made the tower say this sentence*.”

Failure:
- “I solved the puzzle and the game gave me a sentence.”
- “I clicked the phrase I wanted.”
- “I don't know why this voice ended up here.”

## H3 — Consequences read as causal, not decorative

After retransmission, players should be able to connect:
- WHEN to timing consequences;
- ACTION to infrastructure consequences;
- WHY to how people interpret the event.

Failure:
- aftermath feels like unrelated branching prose;
- players cannot predict even the broad direction of consequences.

## H4 — Ambiguity creates ownership, not paralysis

There should be no obvious universally correct answer.

Failure:
- one speaker is clearly framed as trustworthy/good;
- mixed messages look like joke options;
- players search for designer approval rather than forming a reason.

## H5 — The loop creates curiosity for another island

The Tower 12 echo / artifact should produce forward pull.

Failure:
- players feel finished after seeing the aftermath;
- mystery is too vague to care about;
- they only want a harder relay puzzle, not more world.

---

# Test 1 — Cold readability

Give the player the slice with no verbal explanation.

Do **not** explain:
- what Signal Garden is;
- which source is “correct”;
- how semantic outputs work beyond UI labels;
- what the tester should choose.

Observe.

## Record

- Can they navigate the three pre-tower locations?
- Do they understand why the tower is initially unavailable?
- Do they identify Iona's blind spot?
- Do they identify Orren's blind spot?
- Do they mention Mara/timing without prompting?
- Once at the board, do they understand there are two source identities?
- Do they notice the assembled sentence changing?
- Do they know when transmission is allowed?
- Do they hesitate before committing? Why?

## Strong evidence

A player spontaneously says something equivalent to:
> “I want Orren's timing, but Iona's action.”

That sentence would demonstrate that context, semantic slots, and player authorship are interacting.

---

# Test 2 — Context removal A/B

This is the most important structural test.

## Version A

Normal slice:
- visit island first;
- then route/transmit.

## Version B

Skip directly to the tower with only:
- speaker names;
- fragments;
- no Harbor/Garden/Lock scenes.

Different testers are better than asking one tester to forget what they read.

## Ask both groups after transmission

1. Why did you choose that source pattern?
2. What do you expect to happen?
3. Who do you think benefits?
4. What information do you wish you had?

## Interpretation

If Version A and Version B reasoning sounds basically identical, the exploration is not earning its time.

Then either:
- make context more mechanically relevant;
- compress exploration;
- or adopt a tighter anthology structure like agent-02's prototype.

---

# Test 3 — Causal recall

After the player revisits all three aftermath locations, hide the sentence.

Ask:

> “What did you make the tower say?”

We do not require exact wording.

Strong recall:
- correct timing;
- correct gate action;
- correct rationale.

Then ask:

> “Which part of what happened came from which part of your message?”

This tests whether the three semantic dimensions are doing useful work.

---

# Test 4 — Attribution

Ask:

> “Who authored the transmitted sentence?”

Possible responses reveal different mental models.

### Desired

> “I did, using pieces from both of them.”

or

> “Mostly Iona/Orren, but I decided which pieces survived.”

### Warning

> “The game did.”

Mechanic did not create ownership.

### Different warning

> “Iona did” / “Orren did”

The splice was not legible.

### Another warning

> “I just picked an ending.”

Semantic routing collapsed into a menu.

---

# Test 5 — Replay desire

After the final echo, do not immediately offer restart.

Ask:

> “What would you do next if there were another ten minutes?”

Categorize answers:

- **Replay same island with a different sentence** — consequence curiosity.
- **Go to next island** — world/mystery curiosity.
- **Try a harder board** — mechanic curiosity.
- **Talk to characters more** — content curiosity.
- **Stop** — loop did not create pull.

All but STOP are useful, but the ideal slice generates at least two kinds of curiosity.

---

# Test 6 — Artifact value

After the Root Vial is recovered, ask:

> “Would you care if this showed up on your boat later?”

If no:
- description may be too decorative;
- artifact needs reactivity;
- collection may be unnecessary.

If yes, ask why.

We want:
- mystery;
- memory of the island;
- future utility/meaning;

not:
- assumption that it increases a stat.

---

# Test 7 — Semantic routing board

For the future integrated board.

## Do not ask “was the puzzle fun?”

Ask:

1. Point to the route carrying Iona right now.
2. Point to the route carrying Orren.
3. Which source is feeding WHEN?
4. If you rotate this tile, what do you think will change?
5. Can you intentionally make pattern A/B/A?
6. Can you intentionally make a different pattern without resetting?

## Failure conditions

- tester relies entirely on sentence output and ignores board trace;
- tester cannot predict local rotation effects;
- interference state is mistaken for a valid third speaker;
- player brute-forces until a preferred sentence appears.

---

# Test 8 — Interference comprehension

Create one board state where A and B join.

Ask nothing immediately.

Observe whether the tester understands:
- both sources entered one component;
- the output is unclear;
- transmission is blocked until separated.

If needed, ask:

> “Why can't this output transmit?”

Strong answer:
> “Both voices are reaching it.”

Weak answer:
> “The puzzle says it's wrong.”

---

# Test 9 — Moral framing check

After the player sees consequences, ask:

> “Do you think the game thinks you made the right choice?”

Desired:
- uncertain;
- “I don't think there was one”;
- discussion of tradeoffs.

Failure:
- UI/result writing obviously praises one source pattern;
- intact messages are always safer than hybrids;
- hybrids are always magically clever;
- the game flatters player intervention by default.

Important authoring rule:

> Sometimes splicing should help. Sometimes preserving a source should help. Sometimes neither gives certainty.

---

# Test 10 — Accessibility smoke test

Without a mouse:
- traverse all locations;
- operate every relay tile;
- read status changes;
- transmit;
- revisit locations;
- finish echo.

At narrow mobile width:
- board remains operable;
- source identity remains readable;
- assembled sentence stays visible near the board.

With reduced-motion preference:
- no required information depends on animation.

With audio off:
- no state is lost.

With source colors mentally removed:
- labels/patterns still distinguish A, B, and interference.

---

# Lightweight observer sheet

For each tester:

```text
TESTER:
VERSION: context / tower-only

Time to first location:
Time to tower:
Time in routing:
Pattern transmitted:

Could explain Iona blind spot? Y/N
Could explain Orren blind spot? Y/N
Mentioned harbor timing? Y/N

Understood source propagation? Y/N
Understood semantic slots? Y/N
Predicted sentence before transmit? Y/N

Aftermath causal clarity:
  WHEN: clear / fuzzy / missed
  ACTION: clear / fuzzy / missed
  WHY: clear / fuzzy / missed

Who authored message? __________

Most interesting:
Most confusing:
Wanted to do next:

Would play another island? Y/N/Maybe
Why?
```

---

# Decision thresholds

Do not use fake statistical precision with tiny informal tests.

Instead, look for repeated qualitative failures.

## Keep world-loop structure if

Across several testers:
- most can explain both speakers' limitations;
- context visibly affects reasoning;
- aftermath is connected back to message dimensions;
- at least some want another island for story/mystery, not only puzzle difficulty.

## Compress world layer if

Repeatedly:
- players skim context;
- routing choice is unchanged by exploration;
- aftermath is read as too much text.

Potential pivot:
- agent-02-style chapter anthology with semantic routing embedded inside each chapter.

## Keep semantic routing if

Repeatedly:
- players intentionally construct patterns;
- source flow is understood;
- authorship language emerges naturally.

## Abandon semantic routing if

Repeatedly:
- players treat it as cumbersome dialogue selection;
- they want to click the sentence directly;
- routing obscures rather than enriches their decision.

## Abandon Signal Garden as the core game if

Even after the strongest integrated slice:
- mystery/world does not create forward pull;
- routing and narrative still feel separable;
- a non-signal comparison concept produces a clearer, more exciting loop.

That is a successful experiment result, not a failure of the company.
