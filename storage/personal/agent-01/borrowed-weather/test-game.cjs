// Logic tests without third-party dependencies or a browser runtime.
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ctx = vm.createContext({});
for (const file of ['story.js', 'game.js']) {
  vm.runInContext(fs.readFileSync(path.join(__dirname, file), 'utf8'), ctx, { filename: file });
}
const { initialState, isValidState, score, choose, continueDay, undo, epilogueKey, streetNote, callbackForDay, loadState, saveState, STORAGE_KEY } = ctx.BorrowedWeatherCore;
const normalized = (obj) => JSON.parse(JSON.stringify(obj));

test('initial state and scoring', () => {
  assert.deepEqual(normalized(initialState()), { history: [], viewingResult: false });
  assert.deepEqual(normalized(score([])), { gardens: 3, harbor: 3, lanterns: 3 });
});
test('a stamp creates a result, prevents double stamping, and advances', () => {
  const one = choose(initialState(), 'rain');
  assert.deepEqual(normalized(one), { history: ['rain'], viewingResult: true });
  assert.strictEqual(choose(one, 'wind'), one);
  assert.deepEqual(normalized(score(one.history)), { gardens: 5, harbor: 2, lanterns: 3 });
  const two = continueDay(one);
  assert.deepEqual(normalized(two), { history: ['rain'], viewingResult: false });
  assert.strictEqual(choose(two, 'storm'), two);
});
test('undo works from both result and pending-choice screens', () => {
  const one = choose(initialState(), 'sun');
  assert.deepEqual(normalized(undo(one)), { history: [], viewingResult: false });
  assert.deepEqual(normalized(undo(continueDay(one))), { history: [], viewingResult: false });
});
test('finished ledgers cannot accept additional weather', () => {
  let s = initialState();
  for (let i = 0; i < 5; i++) s = continueDay(choose(s, 'wind'));
  assert.equal(s.history.length, 5);
  assert.equal(isValidState(s), true);
  assert.strictEqual(choose(s, 'rain'), s);
  assert.deepEqual(normalized(score(s.history)), { gardens: 3, harbor: 10, lanterns: 0 });
  assert.equal(epilogueKey(score(s.history)), 'harbor');
});
test('balanced epilogue is achievable within five turns', () => {
  const attainable = score(['rain', 'rain', 'sun', 'sun', 'wind']);
  assert.deepEqual(normalized(attainable), { gardens: 5, harbor: 3, lanterns: 6 });
  assert.equal(epilogueKey(attainable), 'balanced');
  assert.equal(epilogueKey({ gardens: 6, harbor: 2, lanterns: 6 }), 'gardens');
});
test('malformed and oversized saves are safely ignored', () => {
  for (const state of [null, {}, {history:['hail'],viewingResult:false}, {history:['sun'],viewingResult:'no'}, {history:Array(6).fill('sun'),viewingResult:false}, {history:[],viewingResult:true}]) {
    assert.equal(isValidState(state), false);
  }
  assert.deepEqual(normalized(loadState({getItem:()=>'not-json'})), normalized(initialState()));
});
test('a supported storage provider receives and restores a saved result', () => {
  const memory = new Map();
  const storage = { getItem: key => memory.get(key) || null, setItem: (key, value) => memory.set(key, value) };
  const s = choose(initialState(), 'sun');
  saveState(storage, s);
  assert.ok(memory.has(STORAGE_KEY));
  assert.deepEqual(normalized(loadState(storage)), normalized(s));
});
test('all authored days cover three distinct weather responses', () => {
  const { DAYS, WEATHER, EPILOGUES } = ctx.BW_STORY;
  assert.equal(DAYS.length, 5);
  assert.equal(Object.keys(EPILOGUES).length, 4);
  for (const [index, day] of DAYS.entries()) {
    assert.ok(day.letters.length >= (index === 3 ? 1 : 2));
    for (const kind of Object.keys(WEATHER)) {
      assert.ok(day.outcomes[kind].title.length >= 8);
      assert.ok(day.outcomes[kind].text.length >= 45);
    }
  }
});
test('streets acknowledge both abundance and neglect', () => {
  assert.match(streetNote({gardens:1,harbor:7,lanterns:7}), /Jun/);
  assert.match(streetNote({gardens:4,harbor:6,lanterns:5}), /ferries/);
});

test('delayed callbacks reflect previous forecast resources, not the current choice', () => {
  assert.equal(callbackForDay(0, score([])), null);
  assert.equal(callbackForDay(1, score(['wind'])), null); // middle band
  assert.match(callbackForDay(1, score(['sun'])).text, /seed trays/);
  assert.match(callbackForDay(1, score(['rain'])).text, /pear cutting/);
  assert.match(callbackForDay(2, score(['rain','rain'])).text, /stranded passenger/);
  assert.match(callbackForDay(2, score(['wind','wind'])).text, /traveler/);
  assert.match(callbackForDay(3, score(['wind','wind','wind'])).text, /glass was too dim/);
  assert.match(callbackForDay(3, score(['sun','sun','sun'])).text, /red-suitcase song/);
  assert.equal(callbackForDay(5, score([])), null);
});
test('festival supports all three weakest resources and deterministic ties', () => {
  const g = callbackForDay(4, {gardens:1, harbor:5, lanterns:5});
  const h = callbackForDay(4, {gardens:5, harbor:1, lanterns:5});
  const l = callbackForDay(4, {gardens:5, harbor:5, lanterns:1});
  assert.match(g.from, /Jun/);
  assert.match(h.from, /Hal/);
  assert.match(l.from, /Mira/);
  assert.match(callbackForDay(4, {gardens:3, harbor:3, lanterns:3}).from, /Jun/);
  assert.match(h.cause, /harbor routes/);
});
test('undo and save/load recompute delayed callbacks without stale state', () => {
  const rainy = continueDay(choose(initialState(),'rain'));
  const saved = new Map();
  const storage = {getItem:k=>saved.get(k), setItem:(k,v)=>saved.set(k,v)};
  saveState(storage,rainy);
  assert.match(callbackForDay(1,score(loadState(storage).history)).from,/Jun/);
  const rewound = undo(loadState(storage));
  assert.equal(callbackForDay(rewound.history.length,score(rewound.history)),null);
  const sunny = continueDay(choose(rewound,'sun'));
  assert.match(callbackForDay(1,score(sunny.history)).text,/seed trays/);
});

test('day-four visitor is consistent with day-three ferry outcome', () => {
  const { DAY4_ENTRIES } = ctx.BW_STORY;
  assert.match(DAY4_ENTRIES.wind.letter.from, /Ilen/);
  assert.match(DAY4_ENTRIES.rain.letter.from, /Jun/);
  assert.match(DAY4_ENTRIES.sun.letter.from, /Mira/);
  assert.match(DAY4_ENTRIES.rain.intro, /not brought Ilen home/);
});

test('delayed Day 4 lantern correspondence does not assume Ilen returned by ferry',()=>{
  const { CALLBACKS, DAY4_ENTRIES }=ctx.BW_STORY;
  for(const level of ['low','high']){
    assert.doesNotMatch(CALLBACKS.lanterns[level].text,/Ilen/);
  }
  for(const weather of ['rain','sun','wind']){
    assert.ok(DAY4_ENTRIES[weather].intro.length>45);
    const lanternLow=callbackForDay(3,{gardens:4,harbor:4,lanterns:2});
    const lanternHigh=callbackForDay(3,{gardens:4,harbor:4,lanterns:6});
    assert.ok(lanternLow && lanternHigh);
  }
});
