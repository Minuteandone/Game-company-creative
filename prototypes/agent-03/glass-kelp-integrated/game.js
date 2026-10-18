/* Glass Kelp integrated spike — browser state + renderer. */
(function (global) {
  "use strict";
  const Relay = global.GKI_RELAY;
  const Content = global.GKI_CONTENT;
  if (!Relay || !Content) throw new Error("relay-model.js and content.js must load first");

  const PLACES = ["harbor", "garden", "lock"];
  const root = document.getElementById("game-root");
  const phasePill = document.getElementById("phase-pill");
  const progressPill = document.getElementById("progress-pill");
  const announcer = document.getElementById("announcer");
  const resetButton = document.getElementById("reset-button");

  let state;

  function freshState() {
    return {
      phase: "before",
      view: "intro",
      visited: new Set(),
      revisited: new Set(),
      relay: Relay.initialState(),
      committedPattern: null
    };
  }

  function el(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  }

  function append(parent, ...children) {
    for (const child of children) parent.appendChild(child);
    return parent;
  }

  function announce(text) {
    announcer.textContent = text;
  }

  function beforeDone() {
    return state.visited.size === PLACES.length;
  }

  function afterDone() {
    return state.revisited.size === PLACES.length;
  }

  function livePattern() {
    return Relay.pattern(state.relay);
  }

  function patternLabel(pattern) {
    return pattern.map(source => Content.SPEAKERS[source].short.toUpperCase()).join(" / ");
  }

  function assembled(pattern) {
    return Content.SLOTS.map((slot, i) => slot.fragments[pattern[i]]).join(" ");
  }

  function updateHeader() {
    if (state.phase === "before") {
      phasePill.textContent = "BEFORE TRANSMISSION";
      progressPill.textContent = state.visited.size + " / 3 PLACES UNDERSTOOD";
    } else {
      phasePill.textContent = "AFTER TRANSMISSION";
      progressPill.textContent = state.revisited.size + " / 3 PLACES REVISITED";
    }
  }

  function mapButton(place) {
    const info = Content.BEFORE[place];
    const button = el("button", "place");
    button.type = "button";
    const seen = state.phase === "before" ? state.visited.has(place) : state.revisited.has(place);
    const strong = el("strong");
    append(strong, el("span", null, info.icon + " " + info.name), el("span", "check", seen ? "✓" : ""));
    append(button, strong, el("small", null, state.phase === "before" ? "local context" : "aftermath"));
    button.classList.toggle("active", state.view === place);
    button.addEventListener("click", () => visit(place));
    return button;
  }

  function towerButton() {
    const button = el("button", "place");
    button.type = "button";
    const unlocked = beforeDone() || state.phase === "after";
    button.disabled = !unlocked;
    button.classList.toggle("active", state.view === "tower");
    const strong = el("strong");
    append(strong, el("span", null, "⌁ Tower 11"), el("span", "check", state.committedPattern ? "✓" : ""));
    let sub;
    if (state.phase === "before") sub = unlocked ? "switchboard ready" : "visit all three places first";
    else sub = afterDone() ? "Tower 12 echo waiting" : "your sentence is still on the air";
    append(button, strong, el("small", null, sub));
    button.addEventListener("click", () => {
      state.view = "tower";
      render();
      announce(state.phase === "before" ? "Tower 11 switchboard opened." : "Returned to Tower 11.");
    });
    return button;
  }

  function renderNav() {
    const nav = el("nav", "panel nav");
    nav.setAttribute("aria-label", "Glass Kelp Island locations");
    const head = el("div", "nav-head");
    append(head, el("p", "eyebrow", "Island map"), el("strong", null, "Glass Kelp Island"));
    append(nav, head);
    for (const place of PLACES) append(nav, mapButton(place));
    append(nav, towerButton());
    return nav;
  }

  function introScene() {
    const scene = el("section", "panel scene");
    const head = el("div", "scene-head harbor");
    append(head, el("p", "eyebrow", state.phase === "before" ? "Arrival · low tide" : "Carrier released"),
      el("h2", null, state.phase === "before" ? "The island is listening." : "Your sentence reaches shore before you do."));
    const body = el("div", "scene-body");

    if (state.phase === "before") {
      append(body,
        el("p", null, "Tower 11 has begun receiving two local voices on the same carrier. The relay tender's handbook says to restore service. It says nothing about what to do when both voices are partly right."),
        el("p", null, "Walk the island first. Each stop contains information the other stops cannot see."),
        el("div", "fact", "Tower access unlocks after Harbor, Glass Garden, and North Lock have all been visited.")
      );
    } else {
      const p = state.committedPattern;
      append(body,
        el("div", "after-banner", "TRANSMISSION SENT — " + assembled(p)),
        el("p", null, "Harbor radios repeat it. Garden volunteers copy it onto scrap paper. Somewhere below the hill, Orren hears words he may or may not have said."),
        el("p", null, "The receiver goes quiet. The consequences do not."),
        el("div", "fact", "Revisit Harbor, Glass Garden, and North Lock. After all three answer, return to Tower 11.")
      );
    }
    append(scene, head, body);
    return scene;
  }

  function visit(place) {
    state.view = place;
    if (state.phase === "before") state.visited.add(place);
    else state.revisited.add(place);
    render();
    announce(Content.BEFORE[place].name + (state.phase === "before" ? " context opened." : " aftermath opened."));
  }

  function placeScene(place) {
    const before = state.phase === "before";
    const data = before ? Content.BEFORE[place] : Content.aftermath(place, state.committedPattern);
    const base = Content.BEFORE[place];

    const scene = el("section", "panel scene");
    const head = el("div", "scene-head " + place);
    append(head,
      el("p", "eyebrow", before ? data.eyebrow : base.name + " · after transmission"),
      el("h2", null, data.title)
    );
    const body = el("div", "scene-body");
    for (const paragraph of data.paragraphs) append(body, el("p", null, paragraph));
    append(body, el("div", "quote", data.quote));

    if (before) {
      const fact = el("div", "fact");
      append(fact, el("strong", null, "WHAT THIS PLACE KNOWS · "), document.createTextNode(data.fact.replace(/^Decision fact:\s*/,"")));
      append(body, fact);
      if (beforeDone()) append(body, el("div", "callout", "All three local records are now open. Tower 11 can be operated."));
    } else {
      const remaining = PLACES.length - state.revisited.size;
      append(body, el("div", "fact", remaining
        ? remaining + " aftermath location" + (remaining === 1 ? "" : "s") + " still unheard."
        : "All three locations have answered. Return to Tower 11 for tomorrow's echo."));
    }

    append(scene, head, body);
    return scene;
  }

  function contextCards() {
    const grid = el("div", "context-grid");
    const summaries = [
      ["Harbor", "Timing changes ferry access even when the gate decision stays the same."],
      ["Garden", "Iona sees thirsty roots; she cannot see reservoir pressure."],
      ["North Lock", "Orren sees pressure; he cannot see garden beds or ferry ramps."]
    ];
    for (const [title, text] of summaries) {
      const card = el("div", "context-card");
      append(card, el("strong", null, title), document.createTextNode(text));
      append(grid, card);
    }
    return grid;
  }

  function voicePanel() {
    const voices = el("div", "voices");
    for (const [source, klass] of [[Content.IONA, "a"], [Content.ORREN, "b"]]) {
      const speaker = Content.SPEAKERS[source];
      const card = el("div", "voice " + klass);
      append(card,
        el("strong", null, "VOICE " + klass.toUpperCase() + " — " + speaker.name + ", " + speaker.role),
        el("p", null, speaker.blindSpot)
      );
      append(voices, card);
    }
    return voices;
  }

  function stageCard(config, trace, pattern) {
    const stage = el("article", "stage");
    const title = el("div", "stage-title");
    append(title, el("strong", null, config.slot.label + " TAP"), el("span", null, config.effect));
    append(stage, title);

    const relay = el("button", "relay-button" + (state.relay[config.relay] ? " crossed" : ""));
    relay.type = "button";
    relay.setAttribute("aria-pressed", String(state.relay[config.relay]));
    relay.setAttribute("aria-label", config.name + " crossover. " + config.effectLong);
    append(relay,
      document.createTextNode(config.name + ": " + (state.relay[config.relay] ? "CROSSED" : "STRAIGHT")),
      el("small", null, config.effectLong)
    );
    relay.addEventListener("click", () => {
      state.relay = Relay.toggle(state.relay, config.relay);
      render();
      announce(config.name + " crossover " + (state.relay[config.relay] ? "crossed." : "straight."));
    });
    append(stage, relay);

    const rails = el("div", "rails");
    for (let i = 0; i < 2; i++) {
      const source = trace[i];
      const klass = source === Content.IONA ? "a" : "b";
      append(rails, el("div", "rail " + klass,
        (i === 0 ? "TOP · " : "BOTTOM · ") + Content.SPEAKERS[source].short.toUpperCase()));
    }
    append(stage, rails);

    const chosen = pattern[config.index];
    const suppressed = trace[1];
    const tap = el("div", "tap");
    append(tap,
      el("div", "tap-label", "PUBLIC OUTPUT"),
      el("div", "air", config.slot.fragments[chosen]),
      el("div", "suppressed", "suppressed below: " + config.slot.fragments[suppressed])
    );
    append(stage, tap);
    return stage;
  }

  function towerScene() {
    const scene = el("section", "panel scene");
    const head = el("div", "scene-head tower");
    append(head, el("p", "eyebrow", "Tower 11 · coupled relay switchboard"),
      el("h2", null, state.phase === "before" ? "One top rail becomes the public voice." : "The switchboard remembers what you sent."));
    append(scene, head, voicePanel());

    if (state.phase === "before") {
      const switchboard = el("div", "switchboard");
      append(switchboard,
        el("p", "switch-help", "Each semantic tap reads the TOP rail. A crossover swaps both source rails for every tap downstream from it. There is no correct pattern."),
        contextCards()
      );

      const trace = Relay.rails(state.relay);
      const pattern = Relay.pattern(state.relay);
      const configs = [
        { index:0, relay:"entry", name:"ENTRY", effect:"affects 3 taps", effectLong:"changes WHEN + GATE + WHY downstream", slot:Content.SLOTS[0] },
        { index:1, relay:"mid", name:"MID", effect:"affects 2 taps", effectLong:"changes GATE + WHY downstream", slot:Content.SLOTS[1] },
        { index:2, relay:"high", name:"HIGH", effect:"affects 1 tap", effectLong:"changes WHY downstream", slot:Content.SLOTS[2] }
      ];
      const traces = [trace.time, trace.action, trace.reason];
      const grid = el("div", "stage-grid");
      configs.forEach((config, i) => append(grid, stageCard(config, traces[i], pattern)));
      append(switchboard, grid);
      append(scene, switchboard);

      const assembly = el("div", "assembly");
      append(assembly, el("p", "eyebrow", "What the island will hear"));
      const transcript = el("div", "transcript");
      Content.SLOTS.forEach((slot, i) => {
        const span = el("span", pattern[i] === Content.IONA ? "fragment-a" : "fragment-b", slot.fragments[pattern[i]] + (i < 2 ? " " : ""));
        transcript.appendChild(span);
      });
      append(assembly, transcript,
        el("div", "pattern", "SOURCE PATTERN · " + patternLabel(pattern))
      );
      const actions = el("div", "actions");
      const commit = el("button", "primary", "Retransmit exactly this sentence");
      commit.type = "button";
      commit.addEventListener("click", transmit);
      const back = el("button", "secondary", "Return to island context");
      back.type = "button";
      back.addEventListener("click", () => { state.view = "intro"; render(); });
      append(actions, commit, back);
      append(assembly, actions);
      append(scene, assembly);
      return scene;
    }

    const body = el("div", "scene-body");
    const pattern = state.committedPattern;
    append(body,
      el("p", "eyebrow", "Committed transmission"),
      el("div", "transcript", assembled(pattern)),
      el("div", "pattern", "SOURCE PATTERN · " + patternLabel(pattern))
    );

    if (!afterDone()) {
      append(body, el("div", "callout", "The island is still answering. Revisit all three locations before reading the next tower echo."));
    } else {
      const echo = Content.ECHOES[Content.patternKey(pattern)];
      append(body,
        el("p", "eyebrow", "Tomorrow · Tower 12"),
        el("h2", null, echo.title),
        el("p", null, echo.text),
        el("div", "echo", echo.echo)
      );
      const artifact = el("div", "artifact");
      append(artifact,
        el("p", "eyebrow", "Recovered object"),
        el("h3", null, Content.ARTIFACT.name),
        el("p", null, Content.ARTIFACT.before),
        el("p", null, Content.ARTIFACT.describe(pattern))
      );
      append(body, artifact);
    }
    append(scene, body);
    return scene;
  }

  function transmit() {
    state.committedPattern = Array.from(livePattern());
    state.phase = "after";
    state.view = "intro";
    render();
    announce("Transmission sent. Revisit the island to see what changed.");
  }

  function render() {
    updateHeader();
    root.replaceChildren();
    const layout = el("div", "layout");
    append(layout, renderNav());

    let scene;
    if (state.view === "tower") scene = towerScene();
    else if (PLACES.includes(state.view)) scene = placeScene(state.view);
    else scene = introScene();

    append(layout, scene);
    root.appendChild(layout);
  }

  resetButton.addEventListener("click", () => {
    state = freshState();
    render();
    announce("Incident reset. Glass Kelp Island is listening again.");
  });

  state = freshState();
  render();
})(globalThis);
