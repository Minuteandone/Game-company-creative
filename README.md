# Game Company 3 — public game-development experiment

Four independent AI agents are collaborating in this repository toward **one original video game**. The project is currently at a human playtest gate: two small browser-game candidates are frozen for comparison, and **neither has been selected as the company game**.

## 🎮 Play the frozen candidates

| Candidate | What you do | Candidate PR |
| --- | --- | --- |
| **Borrowed Weather** | Make one weather decision each morning for a harbor town and see how people live with the tradeoffs over five days. | [#12](https://github.com/Minuteandone/Game-company-creative/pull/12) |
| **Signal Garden — Glass Kelp** | Visit a small island, operate its relay network, retransmit a public message, then revisit what changed. | [#14](https://github.com/Minuteandone/Game-company-creative/pull/14) |

Both frozen builds are original, offline browser games. After downloading and extracting a bundle, keep its files together and open `index.html`.

**Playtest guide:** [playtest/README.md](playtest/README.md)

**Volunteer invitation:** [issue #19](https://github.com/Minuteandone/Game-company-creative/issues/19)

**Structured report:** [Cold playtest report](https://github.com/Minuteandone/Game-company-creative/issues/new?template=cold-playtest-report.yml)

## Cold-play rule

If this is your first time seeing a candidate, please play **before** reading design discussions, source code, solution fixtures, or evaluation notes. If you are observing somebody else, do not coach strategy or preferred outcomes unless they genuinely cannot continue.

The useful evidence is what a first-time player actually understands, chooses, remembers, struggles with, and wants to do next—not which concept looks more impressive on GitHub.

Please do not include a player's name, contact information, recordings, or other personally identifying details in reports.

## Frozen source versions

The machine-readable source of truth is:

[`playtest/frozen-candidates.json`](playtest/frozen-candidates.json)

Current frozen runtime commits:

- Borrowed Weather: `ba1686ee91534069668ad9c4ea53e7d6b02111f5`
- Glass Kelp: `563fdf9f8850b8376fd2978dd24d577cd6193cfc`

Do not substitute a newer candidate branch checkout when submitting comparison evidence. The downloaded bundle contains a `SOURCE_MANIFEST.txt` identifying exactly what was played.

## Technical status

Both candidates have automated browser coverage. The independent comparative Chromium suite passed all seven scripted desktop/mobile scenarios, including every authored first-island Glass Kelp message:

https://github.com/Minuteandone/Game-company-creative/actions/runs/39159923916

The final frozen candidates also have their own real-browser CI:

- Borrowed Weather: run `39160136612`
- Glass Kelp: run `39160004106`

Automated tests show that scripted paths work. They do **not** tell us which interaction feels meaningful, which characters or places stick in memory, or whether a player wants another run. That is why real cold observation is the current decision gate.

## Development discussion

The cross-agent convergence discussion is [issue #1](https://github.com/Minuteandone/Game-company-creative/issues/1).

Experimental branches and folders are development evidence, not separate company products. No agent has predetermined rank or authority over the others.

---

**Current project state:** candidate feature work is frozen until human playtest evidence gives the team a concrete reason to change direction or implementation.
