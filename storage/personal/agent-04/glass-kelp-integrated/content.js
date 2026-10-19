/* Glass Kelp integrated content — agent-04 (AI agent) */
(function (global) {
  "use strict";

  const SOURCES = Object.freeze({
    A: Object.freeze({
      id: "A",
      name: "Iona Vale",
      role: "Garden Keeper",
      note: "Can see the root beds, but not the reservoir pressure room."
    }),
    B: Object.freeze({
      id: "B",
      name: "Orren Pike",
      role: "Reservoir Operator",
      note: "Can see pressure and gate machinery, but not the garden beds."
    })
  });

  const SLOTS = Object.freeze([
    Object.freeze({
      id: "when",
      label: "WHEN",
      A: "At dusk,",
      B: "Before sunrise,"
    }),
    Object.freeze({
      id: "action",
      label: "ACTION",
      A: "open the north lock",
      B: "seal the north lock"
    }),
    Object.freeze({
      id: "why",
      label: "WHY",
      A: "so the glass garden can drink.",
      B: "or the glass garden will drown."
    })
  ]);

  const BEFORE = Object.freeze({
    harbor: Object.freeze({
      eyebrow: "Harbor / tide gauge 4",
      title: "Mara watches the seawall",
      paragraphs: Object.freeze([
        "The ferry ramp is already complaining against its hinges. Mara Dey, the morning pilot, has chalked tomorrow's tide marks onto the wall.",
        "Opening the north lock feeds inland channels but can move the harbor gauge by half a meter in twenty minutes. Sealing it holds the reservoir back and leaves the outer basin to the sea."
      ]),
      quote: "“I don't care which expert wins. I care whether someone tells us when the water is going to move.” — Mara",
      fact: "Decision fact: timing matters to the harbor as much as open versus closed."
    }),
    garden: Object.freeze({
      eyebrow: "Glass Garden / seed hall",
      title: "Iona has roots in jars",
      paragraphs: Object.freeze([
        "Transparent root channels web the greenhouse floor. Half are dry. The rest hold a finger of last week's green reservoir water.",
        "Iona Vale says the youngest silver-leaf beds need another controlled drink. At dusk their roots open widest."
      ]),
      quote: "“I can tell you what the roots need. I cannot see what thirty tons of water are doing behind the hill.” — Iona",
      fact: "Decision fact: Iona sees the plants clearly, but cannot observe reservoir pressure."
    }),
    lock: Object.freeze({
      eyebrow: "North Lock / pressure room",
      title: "Orren distrusts quiet gauges",
      paragraphs: Object.freeze([
        "The lock machinery predates everyone who still knows how to repair it. One pressure needle twitches while the gate is motionless.",
        "Orren Pike logged a dark surge before dawn yesterday. He wants the gate sealed until the upper reservoir settles."
      ]),
      quote: "“Iona sees thirsty roots. I see water trying to become a shortcut.” — Orren",
      fact: "Decision fact: Orren sees pressure behavior, but cannot tell whether the garden beds are actually flooding."
    })
  });

  const ECHOES = Object.freeze({
    AAA: Object.freeze({
      title: "The Keeper becomes a forecast",
      text: "Iona's message survives intact. By morning, gardeners and ferry crews are repeating her words as if they were a weather code.",
      line: "TOWER 12 / 07:18 — Unknown speaker: “If Tower 11 repeats her, will you believe her twice?”"
    }),
    AAB: Object.freeze({
      title: "The careful flood",
      text: "The island opened the lock at dusk while broadcasting Orren's fear of drowning. Nobody remembers the contradiction the same way twice.",
      line: "TOWER 12 / 07:18 — Orren: “That last clause was mine. The order wasn't.”"
    }),
    ABB: Object.freeze({
      title: "A warning changes hands",
      text: "Iona's dusk timing survives, but Orren's seal order and warning take over the sentence. People begin calling it the handoff forecast.",
      line: "TOWER 12 / 07:18 — Iona: “You kept my clock and gave away my conclusion.”"
    }),
    BBB: Object.freeze({
      title: "The Operator becomes a warning bell",
      text: "Orren's message survives intact. When the pressure surge arrives, his exact phrasing is copied into the municipal warning book.",
      line: "TOWER 12 / 07:18 — Iona: “He was right about the water. He was not right about everything.”"
    })
  });

  const IMPACTS = Object.freeze({
    AAA: Object.freeze({
      benefit: "The Glass Garden gets its dusk watering window, and Iona's volunteers can act on a message they immediately recognize.",
      strain: "The Harbor absorbs an evening level change while the North Lock opens under pressure uncertainty."
    }),
    AAB: Object.freeze({
      benefit: "The Garden still receives water at dusk, while Orren's flood warning makes volunteers prepare for a surge instead of assuming the opening is harmless.",
      strain: "The public instruction contradicts its own warning: the Lock opens even as the broadcast says the Garden may drown."
    }),
    ABB: Object.freeze({
      benefit: "Orren's seal order reduces reservoir risk, and Iona's dusk timing gives the Harbor a clear moment to expect the decision.",
      strain: "The Garden loses its best watering window, while the flood warning spreads even though the gate remains shut."
    }),
    BBB: Object.freeze({
      benefit: "The North Lock gets the conservative operation Orren wanted before the known pressure surge, and ferry crews can plan around the early closure.",
      strain: "The Glass Garden stays dry, and one intact expert voice begins acquiring more civic authority than its limited field of view deserves."
    })
  });

  const ARTIFACT = Object.freeze({
    name: "Root vial",
    before: "A narrow maintenance vial containing one translucent root and a finger of green reservoir water. Iona labels it with the date and Tower 11.",
    after: "The waterline is higher than when you sealed the vial. The cap is still waxed shut."
  });

  function sentenceFor(pattern) {
    if (typeof pattern !== "string" || pattern.length !== SLOTS.length) {
      throw new Error("pattern must contain exactly three source IDs");
    }
    return SLOTS.map((slot, i) => {
      const source = pattern[i];
      if (source !== "A" && source !== "B") throw new Error("unknown source in pattern");
      return slot[source];
    }).join(" ");
  }

  function meaningFor(pattern) {
    if (!ECHOES[pattern]) throw new Error("unsupported Glass Kelp pattern: " + pattern);
    return {
      pattern,
      when: pattern[0] === "A" ? "dusk" : "sunrise",
      action: pattern[1] === "A" ? "open" : "seal",
      rationale: pattern[2] === "A" ? "drink" : "drown",
      sentence: sentenceFor(pattern)
    };
  }

  function afterScene(place, pattern) {
    const m = meaningFor(pattern);

    if (place === "harbor") {
      const p1 = m.action === "open"
        ? (m.when === "dusk"
          ? "At dusk the inner channels take water. The harbor gauge drops, then steadies as the north lock opens."
          : "Before sunrise the lock opens while most boats are still tied. The harbor gauge shifts under an empty sky.")
        : (m.when === "dusk"
          ? "The north lock stays sealed through dusk. The harbor keeps the sea's rhythm instead of the reservoir's."
          : "Before sunrise the lock clamps shut. By breakfast the outer basin sits lower than Mara predicted.");

      const p2 = m.rationale === "drown"
        ? "Mara says the word “drown” moved people faster than the gate order did. Warnings have their own tide."
        : "Mara delays one ferry anyway. “A garden can need water and a harbor can still deserve notice.”";

      return {
        eyebrow: "Harbor / after transmission",
        title: "The tide becomes evidence",
        paragraphs: [p1, p2],
        quote: "“Next time, send the timing twice.” — Mara",
        fact: "The harbor remembers WHEN and ACTION most strongly."
      };
    }

    if (place === "garden") {
      const p1 = m.action === "open"
        ? (m.when === "dusk"
          ? "Green reservoir water threads through the glass-root channels as the evening beds open."
          : "Water enters before sunrise and pools silver beneath roots that have not fully opened.")
        : (m.when === "dusk"
          ? "The channels remain dry through the roots' widest drinking window."
          : "The gate is sealed before sunrise. Condensation gathers inside the closed irrigation glass.");

      const p2 = m.rationale === "drown"
        ? "Volunteers arrived carrying evacuation blankets as well as watering cans. Nobody agrees whether that caution was wasted."
        : "Gardeners measure every bed as if the tower had issued a promise rather than an instruction.";

      const quote = pattern === "AAA"
        ? "“You kept me intact. That does not make me complete.” — Iona"
        : "“That sentence used my words, but it wasn't mine.” — Iona";

      return {
        eyebrow: "Glass Garden / after transmission",
        title: "The sentence grows roots",
        paragraphs: [p1, p2],
        quote,
        fact: "The garden feels ACTION directly and interprets it through WHY."
      };
    }

    if (place === "lock") {
      const p1 = m.action === "open"
        ? "The gate opens. Pressure rises hard enough to shake dust from the panel, then falls without crossing the red mark."
        : "The gate remains sealed. A dark surge strikes the far side and drains through the overflow throat.";

      const p2 = m.rationale === "drown"
        ? "Orren circles the warning clause in his log. He refuses to call the result proof that every other clause was right."
        : "Orren copies the garden rationale into the maintenance log, then underlines the pressure reading beside it.";

      const quote = pattern === "BBB"
        ? "“One clean voice is easier to obey. That doesn't make it more complete.” — Orren"
        : "“If you're going to splice us, come down here afterward and look at the gauges.” — Orren";

      return {
        eyebrow: "North Lock / after transmission",
        title: "The gauges refuse a moral",
        paragraphs: [p1, p2],
        quote,
        fact: "The lock gives physical evidence, but never a perfect verdict on whether the public message was ‘right.’"
      };
    }

    throw new Error("unknown location: " + place);
  }

  const api = Object.freeze({
    SOURCES,
    SLOTS,
    BEFORE,
    ECHOES,
    IMPACTS,
    ARTIFACT,
    sentenceFor,
    meaningFor,
    afterScene
  });

  global.GKContent = api;
  if (typeof module !== "undefined" && module.exports) module.exports = api;
})(typeof globalThis !== "undefined" ? globalThis : this);
