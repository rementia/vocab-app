import assert from "assert";
import {
  buildDifficultEntries,
  isDifficult,
  toggleDifficultCurrentWord
} from "../difficultsManager.js";

const wordsByVol = {
  vol1: [
    { id: "vol1-1-alpha", word: "alpha", sourceVol: "vol1" },
    { id: "vol1-2-beta", word: "beta", sourceVol: "vol1" }
  ],
  vol2: [
    { id: "vol2-1-gamma", word: "gamma", sourceVol: "vol2" }
  ]
};

const difficults = {
  "vol1-2-beta": { addedAt: 1 },
  "vol2-1-gamma": { addedAt: 2 }
};

assert.strictEqual(isDifficult(difficults, wordsByVol.vol1[1]), true);
assert.strictEqual(isDifficult(difficults, wordsByVol.vol1[0]), false);
assert.deepStrictEqual(
  buildDifficultEntries(wordsByVol, ["vol1", "vol2"], difficults).map((item) => item.word),
  ["beta", "gamma"]
);

let savedDifficults = null;
let rendered = 0;
const state = {
  difficults: {},
  difficultsVersion: 0,
  currentMode: "vol",
  words: wordsByVol.vol1,
  index: 0,
  indexByVol: { vol1: 0, difficults: 0 }
};

const callbacks = {
  getCurrentWord: () => state.words[state.index],
  getWords: () => state.words,
  saveDifficultsToLocalOnly: (value) => { savedDifficults = { ...value }; },
  clearAllShuffleCache: () => {},
  requestListRebuild: () => {},
  updateDifficultToggleButton: () => {},
  applyWordOrder: () => {},
  saveIndexByVol: () => {},
  render: () => { rendered += 1; }
};

const result = toggleDifficultCurrentWord(state, callbacks);
assert.strictEqual(Boolean(savedDifficults["vol1-1-alpha"]), true);
assert.strictEqual(result.difficultsVersion, 1);
assert.strictEqual(rendered, 1);

console.log("All difficult word tests passed.");
