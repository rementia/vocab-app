import assert from "assert";
import {
  getOrderedWords,
  getWordOrderMode,
  isWordOrderCacheValid,
  makeWordOrderCacheKey,
  shuffleArray
} from "../wordOrderService.js";

const words = [
  { id: "a", word: "alpha" },
  { id: "b", word: "bravo" },
  { id: "c", word: "charlie" }
];

assert.strictEqual(getWordOrderMode({ randomMode: false, frequencyMode: false }), "");
assert.strictEqual(getWordOrderMode({ randomMode: true, frequencyMode: false }), "random");
assert.strictEqual(getWordOrderMode({ randomMode: false, frequencyMode: true }), "frequency");
assert.strictEqual(getWordOrderMode({ randomMode: true, frequencyMode: true }), "frequency-random");

assert.strictEqual(
  makeWordOrderCacheKey({ orderMode: "random", currentMode: "vol", currentVol: "vol2" }),
  "random:vol:vol2"
);
assert.strictEqual(
  makeWordOrderCacheKey({ orderMode: "frequency", currentMode: "favorites", currentVol: "vol1" }),
  "frequency:favorites:all"
);

assert.strictEqual(isWordOrderCacheValid(words, words), true);
assert.strictEqual(isWordOrderCacheValid(words.slice(0, 2), words), false);
assert.strictEqual(isWordOrderCacheValid([{ id: "missing" }, words[1], words[2]], words), false);

assert.deepStrictEqual(
  shuffleArray(words, () => 0).map((item) => item.id),
  ["b", "c", "a"],
  "shuffleArray should allow deterministic testing with injected random"
);
assert.deepStrictEqual(
  words.map((item) => item.id),
  ["a", "b", "c"],
  "shuffleArray should not mutate the original array"
);

const passthroughCache = {};
assert.strictEqual(
  getOrderedWords({
    baseWords: words,
    orderMode: "",
    cache: passthroughCache,
    cacheKey: "",
    getWeight: () => 0
  }),
  words,
  "normal order should return baseWords directly"
);

const frequencyCache = {};
const frequencyWords = getOrderedWords({
  baseWords: words,
  orderMode: "frequency",
  cache: frequencyCache,
  cacheKey: "frequency:vol:vol1",
  getWeight: (item) => ({ a: 1, b: 5, c: -1 })[item.id]
});
assert.deepStrictEqual(
  frequencyWords.map((item) => item.id),
  ["b", "a", "c"],
  "frequency order should sort by descending review weight"
);
assert.strictEqual(
  getOrderedWords({
    baseWords: words,
    orderMode: "frequency",
    cache: frequencyCache,
    cacheKey: "frequency:vol:vol1",
    getWeight: () => 0
  }),
  frequencyWords,
  "valid cache should be reused"
);

console.log("All word order service tests passed.");
