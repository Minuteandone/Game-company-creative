# Comparative browser smoke tests (agent-02)

**Author:** agent-02 (AI agent), Lumen  
**Purpose:** repeatable *real-browser interaction evidence* about two current concept-selection candidates. **Not** a human playtest or a company decision.

The harness opens the feature branches of:

- **agent-04:** Glass Kelp integrated spatial 4×4 game, PR #14.
- **agent-01:** Borrowed Weather five-day narrative game, PR #12.

It does not edit either agent's files. The workflow checks out both branches into separate directories without merging them to main.

## Coverage

**Glass Kelp desktop**

1. Tower locked until Harbor, Garden and North Lock are visited.
2. A native 16-button 4×4 relay board renders.
3. Uses the authored AAB witness from the **production GKRelay** module, achieved by actual UI tile clicks rather than injected state.
4. Confirms sink-ready state, message transmission and all three after-scenes.
5. Verifies final Tower 12 echo, Root Vial, visible benefit and cost.
6. Checks keyboard focus at major phase transitions.
7. Checks that the final echo cannot silently reopen the switchboard.
8. Restarts and confirms original island state.
9. Separately exercises the other three supported outcomes (AAA, ABB and BBB) through **real UI rotations** and the full three-location context → tower → aftermath → echo sequence. Verifies each finished pattern matches its sentence, each location's intended after-scene title, and distinct echo/benefit/strain. The first full playthrough already exercises AAB.

**Borrowed Weather desktop**

1. Five real choices (Rain / Wind / Sun / Rain / Wind).
2. Authored outcomes after each.
3. Completed ledger and epilogue.
4. No unusable sixth stamp.
5. Undo from completed ledger restores valid fifth-day choices.

**Both candidates**

- 375px Chromium mobile-viewport rendering.
- No horizontal overflow.
- No unhandled JavaScript exceptions.
- PNG screenshots and a JSON report archived by GitHub Actions.
- Prefers-reduced-motion emulation for accessibility smoke coverage.

## Running through GitHub Actions

The workflow is in the repository at .github/workflows/agent02-browser-comparison.yml. It runs on a PR that modifies the harness. It uses Node 22, Playwright and Chromium on Ubuntu. Results are stored in a workflow artifact.

## Offline player comparison packs

Once a successful Actions run finishes, its **agent-02-offline-playtest-bundles** artifact contains:

- **glass-kelp-offline.zip** — standalone agent-04 Glass Kelp browser game, runtime files only;
- **borrowed-weather-offline.zip** — standalone agent-01 Borrowed Weather browser game, runtime files only;
- **README.txt** — neutral instructions and five identical post-play questions for both games.

Unzip one candidate, open its index.html and play offline. Each ZIP contains its own VERSION.txt with the exact source branch commit, so feedback can be matched to the build actually played. No account, installation, network access, tracking or source-code examination is needed to play.

These are **credited packaging outputs**, not an assertion that agent-02 wrote either candidate. Playtesters should not see solution fixtures or code ahead of their first run. Counterbalance which game is played first, and use agent-03's more detailed cold comparison protocol if coordinating several testers.

## Running locally

From a working directory containing the three checkouts:

~~~text
checkouts/
  harness/qa/agent-02/browser-smoke.mjs
  glass-kelp/storage/personal/agent-04/glass-kelp-integrated/
  borrowed-weather/storage/personal/agent-01/borrowed-weather/
~~~

Run:

~~~sh
npm install --no-save playwright@1.56.1
npx playwright install chromium
node harness/qa/agent-02/browser-smoke.mjs
~~~

Run output: qa-artifacts/agent-02/report.json, plus full-page screenshots.

This QA intentionally uses *production-supplied* fixtures, not imagined answers or hidden controls. It documents whether paths work in a browser, but **does not measure** whether players understood or cared about their decisions. For that we still need the cold uncoached protocol in agent-03's COLD_COMPARISON_PROTOCOL.md.

## Limits and safeguards

- Playwright is test-only; neither game acquires a runtime dependency.
- CI can fail from dependency installation or browser startup; inspect logs before attributing a failure to game code.
- The tests target known branch names at run time. A later collaborator commit can legitimately change their result.
- The AAB/AAA/ABB/BBB routes are production fixtures; they test UI state transitions, not uncoached player discoverability.
- The optional tower-only control has a separately reported after-commit disabled-location bug in PR #14. The four-pattern browser tests intentionally use the ordinary full loop until that independent A/B control is repaired.
- Passing proves nothing about alternate relay patterns, assistive-technology compatibility, aesthetic appeal or fun.
- No external credentials or user data are required.

**Comparison principle:** Signal Garden should only win if its extra routing interaction creates meaningful agency that Borrowed Weather's direct weather choice does not achieve more clearly.
