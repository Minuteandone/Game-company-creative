/* Borrowed Weather: pure state operations + accessible browser renderer. */
(function (global) {
  "use strict";
  const STORY = global.BW_STORY;
  if (!STORY) throw new Error("story.js must load before game.js");

  const STORAGE_KEY = "borrowed-weather-agent01-v1";
  const RESOURCES = Object.freeze(["gardens", "harbor", "lanterns"]);
  const LABELS = Object.freeze({ gardens: "Roof gardens", harbor: "Harbor routes", lanterns: "Lantern archive" });
  const MAX_RESOURCE = 10;

  function initialState() { return { history: [], viewingResult: false }; }
  function isWeather(value) { return Object.prototype.hasOwnProperty.call(STORY.WEATHER, value); }
  function isValidState(value) {
    return !!value && typeof value === "object" && Array.isArray(value.history) &&
      value.history.length <= STORY.DAYS.length && value.history.every(isWeather) &&
      typeof value.viewingResult === "boolean" &&
      (!value.viewingResult || value.history.length > 0);
  }
  function clamp(value) { return Math.min(MAX_RESOURCE, Math.max(0, value)); }
  function score(history) {
    const values = { gardens: 3, harbor: 3, lanterns: 3 };
    for (const weather of history) {
      const delta = STORY.WEATHER[weather].delta;
      for (const key of RESOURCES) values[key] = clamp(values[key] + delta[key]);
    }
    return values;
  }
  function choose(state, weather) {
    if (!isValidState(state) || !isWeather(weather) || state.viewingResult || state.history.length >= STORY.DAYS.length) return state;
    return { history: [...state.history, weather], viewingResult: true };
  }
  function continueDay(state) {
    if (!isValidState(state) || !state.viewingResult) return state;
    return { history: [...state.history], viewingResult: false };
  }
  function undo(state) {
    if (!isValidState(state) || !state.history.length) return state;
    return { history: state.history.slice(0, -1), viewingResult: false };
  }
  function epilogueKey(values) {
    // Three points apiece is achievable with a 2/2/1 distribution.
    if (Math.min(...RESOURCES.map(r => values[r])) >= 3) return "balanced";
    return [...RESOURCES].sort((a, b) => values[b] - values[a])[0];
  }
  function callbackForDay(dayIndex, values) {
    if (!Number.isInteger(dayIndex) || dayIndex < 1 || dayIndex >= STORY.DAYS.length ||
        !values || RESOURCES.some(key => !Number.isFinite(values[key]))) return null;
    let letter = null;
    let cause = "";
    if (dayIndex === 1) {
      letter = values.gardens <= 2 ? STORY.CALLBACKS.gardens.low :
        values.gardens >= 5 ? STORY.CALLBACKS.gardens.high : null;
      cause = "Earlier rain or sun changed the roof gardens.";
    } else if (dayIndex === 2) {
      letter = values.harbor <= 2 ? STORY.CALLBACKS.harbor.low :
        values.harbor >= 5 ? STORY.CALLBACKS.harbor.high : null;
      cause = "Earlier rain or wind changed harbor access.";
    } else if (dayIndex === 3) {
      letter = values.lanterns <= 2 ? STORY.CALLBACKS.lanterns.low :
        values.lanterns >= 5 ? STORY.CALLBACKS.lanterns.high : null;
      cause = "Earlier sun or wind changed the lantern archive.";
    } else if (dayIndex === 4) {
      // Deterministic tie-break means no hidden RNG and undo/save work without extra state.
      const weakest = [...RESOURCES].sort((a, b) => values[a] - values[b])[0];
      letter = STORY.CALLBACKS.festival[weakest];
      cause = "Earlier forecasts left " + LABELS[weakest].toLowerCase() + " needing the most help.";
    }
    return letter ? { ...letter, cause } : null;
  }
  function streetNote(values) {
    const low = {
      gardens: "From the office window: Jun is painting leaves on empty planters, refusing to forget what belongs there.",
      harbor: "From the office window: Hal's chalkboard of waiting passengers has run out of room for names.",
      lanterns: "From the office window: Mira is telling stories by hand because the glass lanterns have grown quiet."
    };
    const high = {
      gardens: "From the office window: green roofs are appearing along the street, one planter at a time.",
      harbor: "From the office window: two ferries wave to each other like old friends crossing the inlet.",
      lanterns: "From the office window: the archive glows after dusk, and passersby linger to listen."
    };
    const least = [...RESOURCES].sort((a, b) => values[a] - values[b])[0];
    if (values[least] <= 2) return low[least];
    const most = [...RESOURCES].sort((a, b) => values[b] - values[a])[0];
    if (values[most] >= 6) return high[most];
    return "From the office window: Hushport is neither mended nor lost. Someone is setting a second place at the table.";
  }
  function loadState(storage) {
    try {
      const raw = storage && storage.getItem(STORAGE_KEY);
      const parsed = raw ? JSON.parse(raw) : null;
      return isValidState(parsed) ? parsed : initialState();
    } catch (_) { return initialState(); }
  }
  function saveState(storage, state) {
    try { if (storage) storage.setItem(STORAGE_KEY, JSON.stringify(state)); }
    catch (_) { /* Private browsing may disallow storage; play still works. */ }
  }
  const core = { initialState, isValidState, score, choose, continueDay, undo, epilogueKey, streetNote, callbackForDay, loadState, saveState, STORAGE_KEY };
  global.BorrowedWeatherCore = Object.freeze(core);
  if (typeof document === "undefined") return;

  function safeStorage() {
    try { return global.localStorage; }
    catch (_) { return null; }
  }
  const storage = safeStorage();
  const root = document.getElementById("game-root");
  const ticket = document.getElementById("day-ticket");
  const announcer = document.getElementById("announcer");
  const reset = document.getElementById("reset-button");
  let state = loadState(storage);

  function element(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  }
  function append(parent, ...children) { for (const child of children) parent.appendChild(child); return parent; }
  function clear(node) { node.replaceChildren(); }
  function notice(text) { announcer.textContent = text; }
  function commit(next, message) {
    state = next;
    saveState(storage, state);
    render();
    if (message) notice(message);
  }
  function createSection(className, ariaLabel) {
    const section = element("section", "panel " + className);
    section.setAttribute("aria-label", ariaLabel);
    return section;
  }
  function renderLetters(day, dayIndex) {
    const panel = createSection("story-panel", "Incoming correspondence");
    const dayFourEntry = dayIndex === 3 ? STORY.DAY4_ENTRIES[state.history[2]] : null;
    const intro = dayFourEntry ? dayFourEntry.intro : day.intro;
    const lettersToRender = dayFourEntry ? [dayFourEntry.letter, ...day.letters] : day.letters;
    append(panel, element("p", "eyebrow", "Incoming correspondence"), element("h2", null, day.title), element("p", "lead", intro));
    const letters = element("div", "letter-stack");
    for (const letter of lettersToRender) {
      const note = element("article", "letter");
      append(note, element("div", "from", letter.from), element("blockquote", null, letter.text));
      append(letters, note);
    }
    if (state.history.length && !state.viewingResult) {
      const values = score(state.history);
      append(panel, element("p", "street-note", streetNote(values)));
      const callback = callbackForDay(state.history.length, values);
      if (callback) {
        const note = element("article", "letter callback-letter");
        append(note,
          element("p", "eyebrow", "Earlier forecast, later consequence"),
          element("div", "from", callback.from),
          element("blockquote", null, callback.text),
          element("p", "callback-cause", callback.cause));
        append(panel, note);
      }
    }
    append(panel, letters);
    return panel;
  }
  function renderMeters(panel, values) {
    append(panel, element("p", "eyebrow", "Community ledger"));
    const meters = element("div", "meters");
    for (const key of RESOURCES) {
      const item = element("div", "meter");
      const label = element("div", "meter-top");
      append(label, element("strong", null, LABELS[key]), element("span", null, values[key] + " / " + MAX_RESOURCE));
      const track = element("div", "meter-track");
      track.setAttribute("role", "progressbar");
      track.setAttribute("aria-label", LABELS[key]);
      track.setAttribute("aria-valuemin", "0");
      track.setAttribute("aria-valuemax", String(MAX_RESOURCE));
      track.setAttribute("aria-valuenow", String(values[key]));
      const fill = element("div", "meter-fill " + key);
      fill.style.width = (100 * values[key] / MAX_RESOURCE) + "%";
      append(track, fill);
      append(item, label, track);
      append(meters, item);
    }
    append(panel, meters);
  }
  function renderLog(panel) {
    append(panel, element("hr", "section-line"), element("p", "eyebrow", "Previous forecasts"));
    if (!state.history.length) return append(panel, element("p", "empty-log", "Nothing has been stamped. Not yet."));
    for (let i = 0; i < state.history.length; i++) {
      const weather = state.history[i];
      const line = element("div", "log-item");
      const summary = element("div");
      append(summary, element("strong", null, STORY.WEATHER[weather].label), element("p", null, STORY.DAYS[i].outcomes[weather].title));
      append(line, element("span", "log-number", String(i + 1).padStart(2, "0")), summary);
      append(panel, line);
    }
  }
  function addBackButton(panel) {
    if (!state.history.length) return;
    const back = element("button", "text-button", "Undo the last stamp");
    back.type = "button";
    back.addEventListener("click", () => commit(undo(state), "Last stamp undone. You can choose again."));
    append(panel, back);
  }
  function renderDesk(values, isClosed = false) {
    const panel = createSection("desk-panel", "Weather stamping desk");
    renderMeters(panel, values);
    const dayNumber = state.history.length;
    if (isClosed) {
      append(panel, element("p", "eyebrow", "Office closed"), element("p", "desk-note", "All five forecasts have been filed. The ledger is complete; you can still undo the last stamp below."));
    } else if (state.viewingResult) {
      const weather = state.history[dayNumber - 1];
      const result = STORY.DAYS[dayNumber - 1].outcomes[weather];
      const card = element("div", "result-card");
      append(card, element("p", "eyebrow", "Forecast delivered — " + STORY.WEATHER[weather].label), element("h3", null, result.title), element("p", null, result.text));
      const next = element("button", "primary-button", dayNumber === STORY.DAYS.length ? "Read the closing ledger →" : "Open the next morning →");
      next.type = "button";
      next.addEventListener("click", () => commit(continueDay(state), dayNumber === STORY.DAYS.length ? "The closing ledger is ready." : "A new morning begins."));
      append(card, next);
      append(panel, card);
    } else {
      append(panel, element("p", "eyebrow", "One forecast permitted"), element("h2", null, "Choose tomorrow's sky"), element("p", "desk-note", "Every stamp helps someone and makes something harder. There is no perfect forecast."));
      const stampRow = element("div", "stamps");
      for (const weather of ["rain", "sun", "wind"]) {
        const w = STORY.WEATHER[weather];
        const button = element("button", "stamp");
        button.type = "button";
        button.dataset.weather = weather;
        button.setAttribute("aria-label", "Stamp " + w.label + ". " + w.hint);
        append(button, element("span", "glyph", w.glyph), element("span", "stamp-label", w.label), element("span", "code", w.code));
        button.addEventListener("click", () => commit(choose(state, weather), w.label + " stamped. The town responds."));
        append(stampRow, button);
      }
      append(panel, stampRow);
      const guide = element("ul", "stamp-guide");
      for (const weather of ["rain", "sun", "wind"]) append(guide, element("li", null, STORY.WEATHER[weather].hint));
      append(panel, guide);
    }
    renderLog(panel);
    addBackButton(panel);
    return panel;
  }
  function renderFinal() {
    const values = score(state.history);
    const ending = STORY.EPILOGUES[epilogueKey(values)];
    const epilogue = element("section", "epilogue");
    append(epilogue, element("p", "eyebrow", "THE FINAL WEATHER REPORT"), element("h2", null, ending.title), element("p", null, ending.text), element("p", "final-line", "Weather is what happens. A town is what we do about it."));
    const again = element("button", "primary-button", "Begin another five days ↻");
    again.type = "button";
    again.addEventListener("click", restart);
    append(epilogue, again);
    append(root, epilogue, renderDesk(values, true));
  }
  function render() {
    clear(root);
    reset.disabled = state.history.length === 0;
    const completed = state.history.length === STORY.DAYS.length && !state.viewingResult;
    ticket.textContent = completed ? "LEDGER COMPLETE" : "DAY " + String(state.history.length + (state.viewingResult ? 0 : 1)).padStart(2, "0") + " / 05";
    if (completed) return renderFinal();
    const dayIndex = state.history.length - (state.viewingResult ? 1 : 0);
    append(root, renderLetters(STORY.DAYS[dayIndex], dayIndex), renderDesk(score(state.history)));
  }
  function restart() {
    commit(initialState(), "New ledger started. The first morning is ready.");
  }
  reset.addEventListener("click", () => {
    if (state.history.length === 0) return;
    if (global.confirm("Erase this five-day ledger and begin again?")) restart();
  });
  render();
})(globalThis);
