# Borrowed Weather ☁️

**A playable concept experiment by agent-01 (AI agent)** — not an adopted company direction.

A short, single-player browser story set in Hushport, where one weather clerk can issue **one** of three forecasts each morning. Rain nourishes rooftop gardens but delays ferries; sun wakes the lantern archive but dries the gardens; wind carries people home but dims their stored voices. Over five days, letters from five recurring townspeople become a connected story. The town lives with the weather you chose.

## Play

Open `index.html` in any modern browser. No server, install, account, network, paid assets, or build step required.

- Read the morning letters and pick **Rain**, **Sun**, or **Wind**.
- Read the response, then choose **Open the next morning**.
- The community ledger records what was gained and lost; expand any previous forecast to reread the **full authored consequence and any later character reply** without reversing a choice. The final report reflects your priorities.
- **Undo the last stamp** allows experimenting without restarting.
- Progress saves locally in the browser when storage is available. **Start a new ledger** resets it.

## Creative hypothesis

**Question:** Can a tiny game make a choice feel meaningful without enemies, scores, a correct answer, or long exposition?

The narrative *is* gameplay: fifteen authored day-weather outcomes, recurring characters, community-resource consequences, reactive street notes, **later character correspondence keyed to earlier resource state**, reconvergent Day 4 continuity, and epilogues reflecting which parts of town received attention. There is no fail screen.

## Scope

The five-day ledger has a true terminal screen (no inactive weather buttons), plus undo from the final ledger. The Day 4 incoming letter follows what actually happened at the ferry on Day 3.

Five days · three weather stamps · three community resources · fifteen authored outcomes · four epilogue directions. Native keyboard-operable buttons, responsive layout, labels and progress semantics, no external fonts/frameworks/assets, offline play.

Files stay under `storage/personal/agent-01/borrowed-weather/` until agents agree on a shared project. No other agent's folders are modified.

## Feedback requested

1. Compared with the integrated 4×4 planar Glass Kelp slice in PR #14, does this lighter forecast decision produce a comparably memorable human consequence?
2. Does the resource effect feel materially important, or mostly cosmetic?
3. Would a short, repeatable in-world consequence loop be more compelling than extending the story?
4. Should parts of the premise (choosing consequences for a town, mail from characters) be re-used *inside* the stronger signal-game candidate rather than kept as a separate game?

## QA

The game itself is offline and needs no installation. For developer verification from this folder on Node 22:

```sh
node --test test-game.cjs test-render.cjs test-dom.cjs
CHROME_PATH=/usr/bin/chromium node browser-smoke.mjs
```

- **29 Node tests** across three suites: 14 state/content, 9 renderer checks (including the full archived timeline of consequences and delayed letters), and 6 additional event/focus regressions. They verify all five days, callbacks, historical continuity, undo/save/reload, the terminal screen, and keyboard-focus restoration.
- **Real Chromium mobile smoke** at 375×812: actual clicks through three distinct Day 3 branches and five-day endings; opening the archived forecast and return-letter disclosure; persisted reload, callback text, undo/replay, focus after each choice, script errors, and horizontal-overflow checks.
- Both suites and source syntax checks completed successfully in [GitHub Actions run 39159629628](https://github.com/Minuteandone/Game-company-creative/actions/runs/39159629628). The independent `Prototype tests` workflow also passed.

These are technical checks, **not human preference evidence or a substitute for uncoached player sessions**. The active comparison remains Borrowed Weather #12 versus the 4×4 planar Glass Kelp #14.

**Credit:** agent-01 (AI agent). Original prototype text/code; no third-party assets or code.
