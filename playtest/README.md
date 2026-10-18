# Cold comparison playtest

This folder coordinates the current **human evidence gate** for Game Company 3.

It does **not** select a winner.

## Frozen candidates

The exact candidate commits live in:

`playtest/frozen-candidates.json`

Do not substitute newer branch heads when recording comparison evidence.

### Borrowed Weather — PR #12

A five-day civic weather story.

Frozen runtime:

`ba1686ee91534069668ad9c4ea53e7d6b02111f5`

### Signal Garden: Glass Kelp — PR #14

A context → relay routing → public statement → aftermath slice.

Frozen runtime:

`563fdf9f8850b8376fd2978dd24d577cd6193cfc`

## Download the offline builds

Authoritative manifest-pinned bundle run:

https://github.com/Minuteandone/Game-company-creative/actions/runs/39160571351

Artifacts:

- `borrowed-weather-cold-playtest`
- `glass-kelp-cold-playtest`

Each ZIP contains:

- the offline runtime;
- `SOURCE_MANIFEST.txt`;
- `PLAYTEST_README.txt`;
- `OBSERVER_PROTOCOL.md`.

No server, install, account, or network connection is required after extraction.

## Cold-session rule

Do **not** show the player design notes, convergence discussions, source code, solution fixtures, or the observer protocol before play.

Do not explain:
- the intended moral;
- which choice is strategically best;
- which Signal Garden message is easiest to route;
- what the experiment is hoping to prove.

Clarify controls only when genuinely necessary.

## Comparison order

If one person plays both games, alternate order across testers when possible.

Do not infer a winner from one session.

Record what happened before interpreting it.

## Glass Kelp context-removal control

The primary candidate is the ordinary:

`index.html`

A separate context-value experiment is available at:

`index.html?towerOnly=1`

Use the tower-only version with a **different cold tester** from the ordinary version.

Why:

A player who already learned Harbor / Garden / Lock context cannot unlearn it.

The control intentionally:
- withholds those three scenes before transmission;
- exposes the same relay system;
- restores the same aftermath scenes after commitment.

This asks:

> Does knowing the place first materially change the public message the player tries to construct?

It is not an alternate game mode.

## What to observe

The full neutral protocol is bundled with each candidate.

Core questions after play:

1. What did you deliberately cause?
2. Who or what benefited?
3. Who or what paid a cost?
4. What changed later because of an earlier action?
5. Which person or place do you remember most clearly?
6. Did the game seem to believe there was one morally correct choice?
7. What would be lost if the interaction were replaced by a Continue button?
8. If you had ten more minutes, what would you want to do?

Do not reduce these to a single fun score.

## Submit a report

Use the repository's **Cold playtest report** issue form.

Every report should include the exact source commit from the bundle's:

`SOURCE_MANIFEST.txt`

This distinguishes real evidence from branch drift.

## Technical status

Both frozen candidates have automated browser evidence.

Independent comparative Chromium QA:

https://github.com/Minuteandone/Game-company-creative/actions/runs/39159923916

Glass Kelp's four authored normal-game messages (AAA / AAB / ABB / BBB) have each completed through real relay-tile clicks, transmission, aftermath, and their distinct Tower 12 result.

Glass Kelp's repaired tower-only control also passes its branch-local Chromium regression through transmission, three aftermath revisits, and Tower 12.

Borrowed Weather has branch-local Chromium coverage plus comparative desktop/mobile coverage.

These tests prove scripted interaction paths work.

They do **not** prove:
- discoverability;
- enjoyment;
- meaningful agency;
- memorable writing;
- replay desire.

That is why the next evidence is human observation.

## Freeze policy

Until cold reports exist:

- no new candidate concept;
- no feature-count arms race;
- no speculative story expansion;
- no winner by agent vote;
- no moving a frozen SHA silently.

Allowed:
- fix a demonstrated technical blocker;
- repair test/playtest infrastructure;
- improve evidence provenance;
- intentionally re-freeze with a documented reason.

