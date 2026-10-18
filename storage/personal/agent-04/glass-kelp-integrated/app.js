/* Signal Garden — Glass Kelp integrated app, agent-04 (AI agent) */
(function () {
  "use strict";

  const relay = globalThis.GKRelay;
  const content = globalThis.GKContent;
  if (!relay || !content) throw new Error("relay.js and content.js must load before app.js");

  const $ = (id) => document.getElementById(id);
  const LOCATIONS = ["harbor", "garden", "lock"];
  const SOURCE_NAMES = { A: "Iona / A", B: "Orren / B" };
  const PORT_NAMES = ["north", "east", "south", "west"];

  const state = {
    phase: "before",
    current: null,
    visitedBefore: new Set(),
    visitedAfter: new Set(),
    rotations: Array.from(relay.PUZZLE_START),
    moves: 0,
    committedPattern: null
  };

  function announce(message) {
    $("announcer").textContent = "";
    requestAnimationFrame(() => { $("announcer").textContent = message; });
  }

  function phaseLabel() {
    if (state.phase === "before") return "context";
    if (state.phase === "tower") return "routing";
    if (state.phase === "after") return "aftermath";
    return "echo";
  }

  function setActivePlace(place) {
    document.querySelectorAll(".place-button").forEach((button) => {
      button.classList.toggle("active", button.dataset.place === place);
    });
  }

  function renderNav() {
    const visits = state.phase === "before" || state.phase === "tower"
      ? state.visitedBefore
      : state.visitedAfter;

    for (const place of LOCATIONS) {
      $("mark-" + place).textContent = visits.has(place) ? "✓" : "";
    }

    $("visit-label").textContent = visits.size + " / 3";
    $("phase-label").textContent = phaseLabel();

    const tower = $("tower-button");
    if (state.phase === "before") {
      const ready = state.visitedBefore.size === 3;
      tower.disabled = !ready;
      $("tower-label").textContent = ready ? "ready" : "locked";
      $("tower-sub").textContent = ready ? "context archive complete" : "visit all three locations first";
      $("mark-tower").textContent = "";
    } else if (state.phase === "tower") {
      tower.disabled = false;
      $("tower-label").textContent = "routing";
      $("tower-sub").textContent = "switchboard active";
      $("mark-tower").textContent = "";
    } else {
      const ready = state.visitedAfter.size === 3;
      tower.disabled = !ready;
      $("tower-label").textContent = ready ? "echo waiting" : "transmission sent";
      $("tower-sub").textContent = ready ? "return for Tower 12 echo" : "revisit the three locations";
      $("mark-tower").textContent = state.committedPattern ? "✓" : "";
    }

    setActivePlace(state.current);
  }

  function sceneMarkup(scene) {
    return scene.paragraphs.map((p) => "<p>" + p + "</p>").join("");
  }

  function showScene(place) {
    if (!LOCATIONS.includes(place)) return;
    state.current = place;

    if (state.phase === "before" || state.phase === "tower") {
      state.phase = "before";
      state.visitedBefore.add(place);
    } else {
      state.phase = "after";
      state.visitedAfter.add(place);
    }

    const scene = state.phase === "before"
      ? content.BEFORE[place]
      : content.afterScene(place, state.committedPattern);

    $("scene-eyebrow").textContent = scene.eyebrow;
    $("scene-title").textContent = scene.title;
    $("scene-text").innerHTML = sceneMarkup(scene);
    $("scene-quote").textContent = scene.quote;
    $("scene-fact").textContent = scene.fact;

    if (state.phase === "before") {
      $("scene-next").textContent = state.visitedBefore.size === 3
        ? "You have enough context to climb Tower 11."
        : "Keep walking. Tower 11 unlocks after all three locations.";
    } else {
      $("scene-next").textContent = state.visitedAfter.size === 3
        ? "The island has answered. Return to Tower 11."
        : "Revisit the other locations to follow the same message through the island.";
    }

    $("scene-panel").hidden = false;
    $("tower-panel").hidden = true;
    $("echo-panel").hidden = true;
    renderNav();
    announce(scene.title);
  }

  function provenanceClass(ids) {
    if (ids.length > 1) return "interference";
    if (ids[0] === "A") return "source-a";
    if (ids[0] === "B") return "source-b";
    return "";
  }

  function provenanceWords(ids) {
    if (ids.length > 1) return "A and B interference";
    if (ids[0] === "A") return "source A";
    if (ids[0] === "B") return "source B";
    return "unpowered";
  }

  function tileAriaLabel(cell, result) {
    const row = Math.floor(cell / relay.COLS) + 1;
    const col = (cell % relay.COLS) + 1;
    const ports = relay.portsForCell(cell, state.rotations).map((d) => PORT_NAMES[d]).join(", ");
    const source = provenanceWords(result.cellSources[cell]);
    let terminal = "";
    if (cell === 0) terminal += " Source A entry tile.";
    if (cell === 12) terminal += " Source B entry tile.";
    const sink = relay.SINKS.find((s) => s.cell === cell);
    if (sink) terminal += " " + sink.id + " output tile.";
    return "Row " + row + ", column " + col + ". " + relay.TILE_TYPES[cell] +
      " tile. Ports " + ports + ". " + source + "." + terminal + " Activate to rotate clockwise.";
  }

  function tileTerminal(cell) {
    if (cell === 0) return "A IN";
    if (cell === 12) return "B IN";
    return "";
  }

  function tileSinkTag(cell) {
    const sink = relay.SINKS.find((s) => s.cell === cell);
    return sink ? sink.id.toUpperCase() : "";
  }

  function renderBoardTiles(result) {
    const grid = $("relay-grid");
    grid.replaceChildren();

    for (let cell = 0; cell < relay.TILE_TYPES.length; cell++) {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "relay-tile " + provenanceClass(result.cellSources[cell]);
      button.setAttribute("aria-label", tileAriaLabel(cell, result));

      const glyph = document.createElement("span");
      glyph.textContent = relay.glyphFor(cell, state.rotations);
      glyph.setAttribute("aria-hidden", "true");
      button.appendChild(glyph);

      const terminal = tileTerminal(cell);
      if (terminal) {
        const label = document.createElement("span");
        label.className = "terminal";
        label.textContent = terminal;
        label.setAttribute("aria-hidden", "true");
        button.appendChild(label);
      }

      const sinkTag = tileSinkTag(cell);
      if (sinkTag) {
        const label = document.createElement("span");
        label.className = "sink-tag";
        label.textContent = sinkTag;
        label.setAttribute("aria-hidden", "true");
        button.appendChild(label);
      }

      button.addEventListener("click", () => {
        state.rotations = relay.rotate(state.rotations, cell, 1);
        state.moves += 1;
        renderBoard();
        announce("Rotated row " + (Math.floor(cell / 4) + 1) + ", column " + ((cell % 4) + 1) + ".");
      });

      grid.appendChild(button);
    }
  }

  function sinkStatusText(sink) {
    if (sink.state === "interference") return "A + B / static";
    if (sink.state === "clean") return SOURCE_NAMES[sink.source];
    return "unresolved";
  }

  function sinkFragment(sink, slot) {
    if (sink.state === "clean") return slot[sink.source];
    if (sink.state === "interference") return "[voices collide]";
    return "[no clear carrier]";
  }

  function renderSinks(result) {
    result.sinkStates.forEach((sink, index) => {
      const card = $("sink-" + sink.id);
      const slot = content.SLOTS[index];
      card.className = "sink-card";
      if (sink.state === "clean") card.classList.add(sink.source === "A" ? "clean-a" : "clean-b");
      if (sink.state === "interference") card.classList.add("interference");
      card.querySelector(".sink-source").textContent = sinkStatusText(sink);
      card.querySelector(".sink-fragment").textContent = sinkFragment(sink, slot);
    });
  }

  function partialSentence(result) {
    return result.sinkStates.map((sink, index) => sinkFragment(sink, content.SLOTS[index])).join(" ");
  }

  function renderBoard() {
    const result = relay.analyze(state.rotations);
    $("move-count").textContent = String(state.moves);
    renderBoardTiles(result);
    renderSinks(result);

    const valid = result.ready && result.intendedPattern;
    $("transmit-button").disabled = !valid;

    if (valid) {
      $("assembled-sentence").textContent = content.sentenceFor(result.pattern);
      $("pattern-note").textContent = "Reachable Tower 11 pattern " + result.pattern +
        ". You may transmit it or keep routing. No pattern is graded correct.";
      $("operator-hint").textContent = result.pattern[0] === result.pattern[2] && result.pattern[0] !== result.pattern[1]
        ? "This alternating pattern should be impossible on Tower 11's planar board; report a routing bug."
        : "Clean carrier at all three outputs. The board has authored a public statement.";
    } else {
      $("assembled-sentence").textContent = partialSentence(result);
      const interference = result.sinkStates.some((s) => s.state === "interference");
      $("pattern-note").textContent = interference
        ? "A and B have joined somewhere. Separate the components before retransmission."
        : "Three clean outputs are required before retransmission.";
      $("operator-hint").textContent = state.moves >= 12
        ? "Hint: each source can branch. You do not need every tile powered; you need three clean right-edge outputs."
        : "Colored tiles show source provenance. Unlit tiles are disconnected; striped static means both voices have collided.";
    }

    renderNav();
  }

  function showTower() {
    if (state.phase === "before" && state.visitedBefore.size < 3) return;

    state.current = "tower";

    if (state.phase === "after") {
      if (state.visitedAfter.size < 3) return;
      return showEcho();
    }

    state.phase = "tower";
    $("scene-panel").hidden = true;
    $("echo-panel").hidden = true;
    $("tower-panel").hidden = false;
    renderBoard();
    renderNav();
    announce("Tower 11 switchboard active.");
  }

  function transmit() {
    const result = relay.analyze(state.rotations);
    if (!result.ready || !result.intendedPattern) return;

    state.committedPattern = result.pattern;
    state.phase = "after";
    state.current = null;
    state.visitedAfter.clear();

    const sentence = content.sentenceFor(result.pattern);
    $("transmission-banner").hidden = false;
    $("transmission-banner").textContent = "TRANSMISSION SENT — “" + sentence + "” The island is already reacting.";

    $("tower-panel").hidden = true;
    $("scene-panel").hidden = false;
    $("echo-panel").hidden = true;

    $("scene-eyebrow").textContent = "Tower 11 / carrier released";
    $("scene-title").textContent = "Your sentence leaves the hill.";
    $("scene-text").innerHTML =
      "<p>Harbor radios repeat it. Garden volunteers copy it onto scrap paper. In the pressure room, Orren hears words that may or may not have remained his.</p>" +
      "<p>The switchboard goes quiet. The consequences do not.</p>";
    $("scene-quote").textContent = "A public message stops belonging to the tower as soon as somebody acts on it.";
    $("scene-fact").textContent = "Revisit Harbor, Glass Garden, and North Lock. Each place will read a different part of the same sentence.";
    $("scene-next").textContent = "Follow the message through the island.";

    renderNav();
    announce("Transmission sent. Revisit the three locations.");
  }

  function showEcho() {
    if (!state.committedPattern || state.visitedAfter.size < 3) return;
    state.phase = "echo";
    state.current = "tower";

    const echo = content.ECHOES[state.committedPattern];
    $("echo-title").textContent = echo.title;
    $("echo-text").textContent = echo.text;
    $("echo-line").textContent = echo.line;
    $("artifact-name").textContent = content.ARTIFACT.name;
    $("artifact-before").textContent = content.ARTIFACT.before;
    $("artifact-after").textContent = content.ARTIFACT.after;

    $("scene-panel").hidden = true;
    $("tower-panel").hidden = true;
    $("echo-panel").hidden = false;
    renderNav();
    announce("Tower 12 echo received. Root vial recovered.");
    $("echo-panel").scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function resetBoard() {
    state.rotations = Array.from(relay.PUZZLE_START);
    state.moves = 0;
    renderBoard();
    announce("Switchboard returned to the arrival scramble.");
  }

  function restart() {
    state.phase = "before";
    state.current = null;
    state.visitedBefore.clear();
    state.visitedAfter.clear();
    state.rotations = Array.from(relay.PUZZLE_START);
    state.moves = 0;
    state.committedPattern = null;

    $("transmission-banner").hidden = true;
    $("echo-panel").hidden = true;
    $("tower-panel").hidden = true;
    $("scene-panel").hidden = false;

    $("scene-eyebrow").textContent = "arrival / service path";
    $("scene-title").textContent = "The island is listening.";
    $("scene-text").innerHTML =
      "<p>Three short paths leave Tower 11. Nobody agrees on what the tower should repeat, only that it has started receiving voices again.</p>" +
      "<p>Visit the Harbor, Glass Garden, and North Lock before touching the receiver.</p>";
    $("scene-quote").textContent = "“If the tower is going to speak for us, it should at least know where we live.” — handwritten note on the service gate";
    $("scene-fact").textContent = "The tower unlocks after you gather local context.";
    $("scene-next").textContent = "Choose a location from the field route.";

    renderNav();
    announce("Glass Kelp Island restarted.");
  }

  document.querySelectorAll(".place-button[data-place]").forEach((button) => {
    button.addEventListener("click", () => {
      const place = button.dataset.place;
      if (place === "tower") showTower();
      else showScene(place);
    });
  });

  $("reset-board").addEventListener("click", resetBoard);
  $("leave-tower").addEventListener("click", () => {
    state.phase = "before";
    state.current = null;
    $("tower-panel").hidden = true;
    $("scene-panel").hidden = false;
    renderNav();
    announce("Returned to the island.");
  });
  $("transmit-button").addEventListener("click", transmit);
  $("restart-button").addEventListener("click", restart);

  renderNav();
})();
