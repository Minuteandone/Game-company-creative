/* Glass Kelp Island content/state data for the integrated spike.
   agent-03 (AI agent). World/character seed derives from agent-04's PR #8
   world-loop experiment and WORLD_BIBLE; implementation/text here is a new
   synthesis experiment, not company canon. */
(function (global) {
  "use strict";

  const IONA = "iona";
  const ORREN = "orren";

  const SPEAKERS = Object.freeze({
    iona: Object.freeze({
      name: "Iona Vale",
      role: "Garden Keeper",
      short: "Iona",
      blindSpot: "She can see the roots and seed beds, but not the reservoir pressure chamber."
    }),
    orren: Object.freeze({
      name: "Orren Pike",
      role: "Reservoir Operator",
      short: "Orren",
      blindSpot: "He can see the pressure system, but not the garden beds or harbor ramp."
    })
  });

  const SLOTS = Object.freeze([
    Object.freeze({
      id: "time",
      label: "WHEN",
      fragments: Object.freeze({
        iona: "At dusk,",
        orren: "Before sunrise,"
      })
    }),
    Object.freeze({
      id: "action",
      label: "GATE",
      fragments: Object.freeze({
        iona: "open the north lock",
        orren: "seal the north lock"
      })
    }),
    Object.freeze({
      id: "reason",
      label: "WHY",
      fragments: Object.freeze({
        iona: "so the glass garden can drink.",
        orren: "or the glass garden will drown."
      })
    })
  ]);

  const BEFORE = Object.freeze({
    harbor: Object.freeze({
      icon: "⚓",
      name: "Harbor",
      eyebrow: "Harbor · tide gauge 4",
      title: "Mara writes tomorrow on the seawall",
      paragraphs: Object.freeze([
        "The ferry ramp is already low enough to complain against its hinges. Pilot Mara Dey has chalked three possible waterlines beside tomorrow's departures.",
        "Opening the north lock can change the harbor quickly. The exact hour matters: a safe ferry at dusk can become a grounded ferry before breakfast."
      ]),
      quote: "“I do not need the experts to agree. I need the water to move when people know it will.” — Mara",
      fact: "Decision fact: timing matters to the harbor independently of whether the gate opens or closes."
    }),
    garden: Object.freeze({
      icon: "⌂",
      name: "Glass Garden",
      eyebrow: "Glass Garden · seed hall",
      title: "Iona keeps thirsty roots in glass",
      paragraphs: Object.freeze([
        "Transparent channels web the greenhouse floor. Some hold green reservoir water; others are dry enough that silver-leaf roots curl away from the glass.",
        "Keeper Iona Vale says the beds take water best at dusk. She wants one controlled opening before another row of seedlings goes dormant."
      ]),
      quote: "“I can show you a dying root. I cannot show you what the reservoir is doing behind the hill.” — Iona",
      fact: "Decision fact: Iona directly observes the garden, but cannot see reservoir pressure."
    }),
    lock: Object.freeze({
      icon: "▤",
      name: "North Lock",
      eyebrow: "North Lock · pressure room",
      title: "Orren listens for pressure in old metal",
      paragraphs: Object.freeze([
        "The lock machinery is older than its maintenance manual. A red pressure needle twitches even with the gate still.",
        "Operator Orren Pike logged an unexplained surge before dawn yesterday. He wants the gate shut until the reservoir settles."
      ]),
      quote: "“Iona sees thirsty roots. I see water trying to become a shortcut.” — Orren",
      fact: "Decision fact: Orren directly observes reservoir pressure, but cannot see what the garden or harbor is experiencing."
    })
  });

  function interpret(pattern) {
    if (!Array.isArray(pattern) || pattern.length !== 3) throw new TypeError("Expected three-source pattern");
    return Object.freeze({
      time: pattern[0] === IONA ? "dusk" : "sunrise",
      action: pattern[1] === IONA ? "open" : "seal",
      reason: pattern[2] === IONA ? "drink" : "drown",
      pattern: Object.freeze(pattern.slice())
    });
  }

  function patternKey(pattern) {
    return pattern.map(source => source === IONA ? "a" : "b").join("");
  }

  function integrity(pattern, speaker) {
    return pattern.filter(source => source === speaker).length;
  }

  function aftermath(place, pattern) {
    const s = interpret(pattern);
    const mixed = integrity(pattern, IONA) > 0 && integrity(pattern, ORREN) > 0;

    if (place === "harbor") {
      const first = s.action === "open"
        ? (s.time === "dusk"
          ? "At dusk, the inner channels take water. Mara holds the last ferry long enough for the ramp to settle."
          : "Before sunrise, the lock opens while the boats are still tied. By breakfast, the first ferry is an hour late.")
        : (s.time === "dusk"
          ? "The lock stays shut through dusk. The harbor follows the sea instead of the reservoir, and Mara keeps the evening crossing."
          : "The gate clamps shut before sunrise. The outer basin drops lower than Mara's chalk line and the first ferry scrapes mud.");

      const second = s.reason === "drown"
        ? "Because the broadcast sounded like a flood warning, crews moved ropes and passengers before anyone knew whether the danger was real."
        : "Because the broadcast framed the decision around the garden, dockworkers complain that the harbor was treated as a side effect.";

      return {
        title: "The tide becomes evidence",
        paragraphs: [first, second],
        quote: mixed
          ? "“That sentence had two mouths. The tide only got one version.” — Mara"
          : "“One clear voice is easier to schedule around. Easier is not the same as complete.” — Mara"
      };
    }

    if (place === "garden") {
      const first = s.action === "open"
        ? (s.time === "dusk"
          ? "Green water threads through the glass-root channels exactly as the evening beds begin to open."
          : "Water enters before sunrise, pooling silver beneath beds that have not fully opened.")
        : (s.time === "dusk"
          ? "Dusk passes with the channels dry. Iona watches the youngest roots curl tighter in their tubes."
          : "The gate stays shut before sunrise. Cold condensation beads inside the closed irrigation lines.");

      const second = s.reason === "drink"
        ? (s.action === "seal"
          ? "The phrase “seal it so the garden can drink” makes no engineering sense, so gardeners start collecting condensation by hand. It is enough for one bed."
          : "Volunteers treat the message as an instruction and begin measuring exactly how much each bed received.")
        : (s.action === "open"
          ? "A flood warning attached to an order to open the gate brings half the volunteers with buckets and half with evacuation blankets."
          : "The beds stay dry. Nobody can prove whether a flood was prevented or never coming.");

      return {
        title: "The sentence grows roots",
        paragraphs: [first, second],
        quote: mixed
          ? "“That is not what either of us said. That makes it yours.” — Iona"
          : "“You kept one voice intact. You also kept its blind spot.” — Iona"
      };
    }

    if (place === "lock") {
      const first = s.action === "open"
        ? (s.time === "dusk"
          ? "Orren logs the dusk opening. Pressure climbs sharply, then falls without crossing the red line."
          : "The gate opens before sunrise. For nineteen seconds, the damaged pressure needle pins itself against the stop.")
        : (s.time === "dusk"
          ? "The gate remains sealed at dusk. Pressure gathers, then bleeds through the old overflow throat."
          : "Orren seals the gate before sunrise. Minutes later, a dark surge strikes the far side hard enough to shake dust from the ceiling.");

      const second = s.reason === "drown"
        ? (s.action === "open"
          ? "Orren circles the word DROWN in the logbook, furious that his warning was used to justify the opposite gate action."
          : "For the first time that morning, Orren stops arguing with the tower.")
        : (s.action === "seal"
          ? "He discovers that the sealed pipes are collecting enough condensation to feed one garden bed anyway."
          : "He writes that one safe opening does not prove the next opening will be safe.");

      return {
        title: "The gauges refuse a moral",
        paragraphs: [first, second],
        quote: mixed
          ? "“If you splice us, come down afterward and look at what your sentence did.” — Orren"
          : "“I was right about one thing. Do not make that mean I was right about everything.” — Orren"
      };
    }

    throw new RangeError("Unknown location");
  }

  const ECHOES = Object.freeze({
    aaa: Object.freeze({
      title: "The Keeper becomes a forecast",
      text: "By morning, Iona's intact instruction is copied onto greenhouse tags and harbor chalkboards.",
      echo: "TOWER 12 / 07:18 — “If the tower repeats one person clearly enough, when do they become weather?”"
    }),
    aab: Object.freeze({
      title: "A warning nobody originally gave",
      text: "The island remembers the contradiction more vividly than the result. Children call the evening the careful flood.",
      echo: "TOWER 12 / 07:18 — Orren: “That last clause was mine. The order was not.”"
    }),
    aba: Object.freeze({
      title: "The quiet watering",
      text: "The impossible instruction to seal the gate so the garden can drink becomes a name for collecting condensation from closed pipes.",
      echo: "TOWER 12 / 07:18 — Iona: “Please do not turn an accident into certainty.”"
    }),
    abb: Object.freeze({
      title: "The evacuation that found no disaster",
      text: "The warning empties the seed hall. Nothing floods. Half the island calls the tower wrong; half says avoided disasters always look imaginary.",
      echo: "TOWER 12 / 07:18 — Mara: “How do you prove a warning saved you?”"
    }),
    baa: Object.freeze({
      title: "Morning water, unreadable writing",
      text: "The early opening leaves luminous mineral traces beneath the greenhouse floor that some residents insist are letters.",
      echo: "TOWER 12 / 07:18 — “You changed the time. That is why we can reach you now.”"
    }),
    bab: Object.freeze({
      title: "The impossible emergency",
      text: "Both original speakers deny the sentence. The pressure surge still misses the old overflow pipe by seconds.",
      echo: "TOWER 12 / 07:18 — Iona + Orren: “We did not say that.” / THIRD VOICE: “But you did.”"
    }),
    bba: Object.freeze({
      title: "A contradiction becomes civic work",
      text: "Because the order sounds impossible, residents inspect every pipe instead of obeying blindly. They discover three leaks.",
      echo: "TOWER 12 / 07:18 — MAINTENANCE BAND: “Bad sentence. Useful inspection.”"
    }),
    bbb: Object.freeze({
      title: "The Operator becomes a warning bell",
      text: "The surge arrives, the closed gate holds, and by breakfast people repeat Orren's exact words whenever a gauge twitches.",
      echo: "TOWER 12 / 07:18 — Iona: “He was right about the water. He was not right about everything.”"
    })
  });

  const ARTIFACT = Object.freeze({
    name: "Glass root vial",
    before: "A thumb-length tube holding one pale root and a line of green reservoir water.",
    describe(pattern) {
      const state = interpret(pattern);
      if (state.action === "open") {
        return "The root has uncurled. A new green line marks the water level from the night you opened the lock.";
      }
      return "The root remains curled, but beads of condensation cling to the sealed glass like tiny lenses.";
    }
  });

  global.GKI_CONTENT = Object.freeze({
    IONA,
    ORREN,
    SPEAKERS,
    SLOTS,
    BEFORE,
    ECHOES,
    ARTIFACT,
    interpret,
    patternKey,
    integrity,
    aftermath
  });
})(globalThis);
