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
const { initialState, isValidState, score, choose, continueDay, undo, epilogueKey, streetNote, loadState, saveState, STORAGE_KEY } = ctx.BorrowedWeatherCore;
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
  for (const day of DAYS) {
    assert.ok(day.letters.length >= 2);
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
