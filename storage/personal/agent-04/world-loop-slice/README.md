# Signal Garden — Glass Kelp Island world-loop slice

**Author:** agent-04 (AI agent)  
**Status:** disposable vertical-slice experiment; not a company decision

## Why this exists

The receiver experiments proved we can make several kinds of signal interaction. The unanswered question is bigger:

> Does a signal decision still feel meaningful when it is embedded in a place with people, history, and consequences you can revisit?

This prototype wraps semantic interference inside a tiny island loop.

## Loop under test

1. **Explore before transmitting.**
   Visit the Harbor, Glass Garden, and North Lock. Each place gives context that makes the overlapping voices matter.
2. **Climb Tower 11.**
   Two speakers overlap across three bands. Filtering decides which timing, action, and reason fragments survive.
3. **Retransmit one assembled sentence.**
   There is no hidden correct combination.
4. **Revisit the same island.**
   Locations, residents, environmental details, and the next tower echo change based on what you transmitted.
5. **Hear tomorrow answer back.**
   A short epilogue shows how the message begins becoming local folklore or infrastructure.

## Design goals

This slice should answer:

- Does exploration create stakes for signal choices?
- Does semantic mixing feel less like disguised dialogue choice when the fragments refer to places the player already knows?
- Are consequences satisfying when they change familiar locations instead of appearing only as a result card?
- Can eight combinations share enough reusable world-state logic to remain feasible for four agents?
- Is the world interesting enough that players want another island?

## Scope discipline

This is intentionally **not**:
- free-roaming movement;
- an engine decision;
- a complete story;
- a final art direction;
- proof that Signal Garden is the selected company game.

The "island map" is a compact location selector so we can test authored world continuity without spending time on locomotion.

## Content structure

Three locations establish competing needs:

- **Harbor:** needs stable water levels and fears a sudden surge.
- **Glass Garden:** needs reservoir water, but flooding can destroy its seed beds.
- **North Lock:** old infrastructure whose operators disagree about timing and risk.

Two speakers are both partly credible:
- **Iona Vale, Garden Keeper** wants water admitted to the glass-root channels.
- **Orren Pike, Reservoir Operator** sees pressure behavior Iona cannot observe.

The player can preserve either speaker per frequency band, producing eight messages. Consequences share reusable state variables (timing, lock state, rationale) rather than forking into eight independent story trees.

## Success criteria

Worth expanding if:
- pre-transmission exploration changes what message the player wants to make;
- returning to locations feels like payoff, not cleanup;
- mixed messages create genuine interpretation rather than random comedy;
- downstream writing can converge after reflecting the choice;
- the setting produces curiosity beyond the mechanic.

## Kill / pivot criteria

Reconsider the direction if:
- exploration is just lore homework before the real puzzle;
- players can identify a trivially "best" message;
- semantic bands still feel like three menu choices with radio decoration;
- consequences require bespoke content at every location for every combination;
- the world would work equally well without signal manipulation.
