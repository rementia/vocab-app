import assert from "assert";
import { loadSavedState } from "../savedStateController.js";
import { STORAGE_KEYS } from "../storage.js";

const values = new Map();
globalThis.localStorage = {
  getItem(key) {
    return values.has(key) ? values.get(key) : null;
  },
  setItem(key, value) {
    values.set(key, String(value));
  }
};

values.set(STORAGE_KEYS.vol, "vol2");
values.set(STORAGE_KEYS.mode, "favorites");
values.set(STORAGE_KEYS.sidebarOpen, "false");
values.set(STORAGE_KEYS.speechSync, "true");
values.set(STORAGE_KEYS.indexByVol, JSON.stringify({ vol2: 3 }));
values.set(STORAGE_KEYS.favorites, JSON.stringify({ Abandon: { addedAt: 1 } }));
values.set(STORAGE_KEYS.difficults, JSON.stringify({ Expand: { addedAt: 2 } }));
values.set(STORAGE_KEYS.reviewScores, JSON.stringify({ Permit: { score: 2 } }));
values.set(STORAGE_KEYS.favoritesUpdatedAt, "100");
values.set(STORAGE_KEYS.difficultsUpdatedAt, "200");
values.set(STORAGE_KEYS.challengeMode, "true");
values.set(STORAGE_KEYS.challengeTime, "99999");
values.set(STORAGE_KEYS.displayTime, "500");
values.set(STORAGE_KEYS.translationMode, "true");
values.set(STORAGE_KEYS.multipleChoiceMode, "true");
values.set(STORAGE_KEYS.autoPlay, "once");
values.set(STORAGE_KEYS.randomMode, "true");
values.set(STORAGE_KEYS.frequencyMode, "true");

const state = loadSavedState({
  volOrder: ["vol1", "vol2", "vol3", "vol4"],
  defaultSidebarOpen: true,
  initialIndexByVol: { vol1: 0, vol2: 0 }
});

assert.strictEqual(state.currentVol, "vol2");
assert.strictEqual(state.currentMode, "favorites");
assert.strictEqual(state.sidebarOpen, false);
assert.strictEqual(state.speechSync, true);
assert.deepStrictEqual(state.indexByVol, { vol2: 3 });
assert.strictEqual(Boolean(state.favorites.abandon), true, "favorites should be normalized by word key");
assert.strictEqual(Boolean(state.difficults.expand), true, "difficults should be normalized by word key");
assert.strictEqual(Boolean(state.reviewScores.permit), true, "review scores should be normalized by word key");
assert.strictEqual(state.favoritesUpdatedAt, 100);
assert.strictEqual(state.difficultsUpdatedAt, 200);
assert.strictEqual(state.challengeMode, true);
assert.strictEqual(state.challengeTime, 5000, "challenge time should be clamped to slider bounds");
assert.strictEqual(state.displayTime, 1000, "display time should be clamped to slider bounds");
assert.strictEqual(state.translationMode, true);
assert.strictEqual(state.multipleChoiceMode, true);
assert.strictEqual(state.randomMode, true);
assert.strictEqual(state.frequencyMode, true);
assert.strictEqual(values.get(STORAGE_KEYS.autoPlay), "off", "saved autoplay should be reset on startup");

console.log("All saved state controller tests passed.");
