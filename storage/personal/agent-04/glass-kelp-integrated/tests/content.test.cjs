const test = require("node:test");
const assert = require("node:assert/strict");
const relay = require("../relay.js");
const content = require("../content.js");

test("every intended relay pattern assembles a supported message", () => {
  for (const pattern of relay.INTENDED_PATTERNS) {
    const sentence = content.sentenceFor(pattern);
    assert.ok(sentence.length > 30);
    assert.ok(content.ECHOES[pattern]);
    const meaning = content.meaningFor(pattern);
    assert.equal(meaning.pattern, pattern);
    assert.equal(meaning.sentence, sentence);
  }
});

test("all three locations have decision-relevant before scenes", () => {
  for (const id of ["harbor", "garden", "lock"]) {
    const scene = content.BEFORE[id];
    assert.ok(scene.title.length > 5);
    assert.ok(scene.paragraphs.length >= 2);
    assert.ok(scene.fact.startsWith("Decision fact:"));
  }
});

test("every reachable pattern has aftermath at all three locations", () => {
  for (const pattern of relay.INTENDED_PATTERNS) {
    for (const id of ["harbor", "garden", "lock"]) {
      const scene = content.afterScene(id, pattern);
      assert.ok(scene.title.length > 5);
      assert.ok(scene.paragraphs.join(" ").length > 80);
      assert.ok(scene.quote.length > 15);
      assert.ok(scene.fact.length > 20);
    }
  }
});

test("unsupported alternating patterns are not accidentally authored as final echoes", () => {
  for (const pattern of ["ABA", "BAA", "BAB", "BBA"]) {
    assert.equal(content.ECHOES[pattern], undefined);
    assert.throws(() => content.meaningFor(pattern), /unsupported/);
  }
});

test("intact and hybrid messages preserve source authorship differences", () => {
  assert.match(content.sentenceFor("AAA"), /At dusk/);
  assert.match(content.sentenceFor("AAA"), /open the north lock/);
  assert.match(content.sentenceFor("AAA"), /can drink/);

  assert.match(content.sentenceFor("AAB"), /At dusk/);
  assert.match(content.sentenceFor("AAB"), /open the north lock/);
  assert.match(content.sentenceFor("AAB"), /will drown/);

  assert.match(content.sentenceFor("ABB"), /At dusk/);
  assert.match(content.sentenceFor("ABB"), /seal the north lock/);
  assert.match(content.sentenceFor("ABB"), /will drown/);

  assert.match(content.sentenceFor("BBB"), /Before sunrise/);
});

test("artifact supports one persistent mystery beat", () => {
  assert.match(content.ARTIFACT.before, /root/i);
  assert.match(content.ARTIFACT.after, /waterline/i);
});
