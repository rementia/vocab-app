import assert from "assert";
import { createCloudSyncController } from "../cloudSyncController.js";

let authHandler = null;
const calls = [];
let state = {
  currentUser: null,
  favorites: { local: true },
  favoritesUpdatedAt: 1,
  difficults: { hard: true },
  difficultsUpdatedAt: 2
};

const controller = createCloudSyncController({
  auth: {},
  db: {},
  collectionName: "portfolioUsers",
  onAuthStateChanged: (_auth, handler) => { authHandler = handler; },
  subscribeFavoritesRealtimeRemote: (_db, collectionName, uid, onChange) => {
    calls.push(["subscribe", collectionName, uid]);
    onChange({ exists: () => true });
    return () => calls.push(["unsubscribe"]);
  },
  saveFavoritesToCloudRemote: (_db, collectionName, uid, favorites, updatedAt) => {
    calls.push(["saveFavorites", collectionName, uid, favorites, updatedAt]);
  },
  saveDifficultsToCloudRemote: (_db, collectionName, uid, difficults, updatedAt) => {
    calls.push(["saveDifficults", collectionName, uid, difficults, updatedAt]);
  },
  syncFavoritesWithCloud: async (_db, collectionName, uid, favorites, updatedAt) => {
    calls.push(["syncFavorites", collectionName, uid, favorites, updatedAt]);
    return { favorites: { cloudFavorite: true }, favoritesUpdatedAt: 10 };
  },
  syncDifficultsWithCloud: async (_db, collectionName, uid, difficults, updatedAt) => {
    calls.push(["syncDifficults", collectionName, uid, difficults, updatedAt]);
    return { difficults: { cloudDifficult: true }, difficultsUpdatedAt: 20 };
  },
  resolveFavoritesSnapshot: () => ({ favorites: { realtimeFavorite: true }, favoritesUpdatedAt: 30 }),
  resolveDifficultsSnapshot: () => ({ difficults: { realtimeDifficult: true }, difficultsUpdatedAt: 40 }),
  getState: () => state,
  setCurrentUser: (user) => { state = { ...state, currentUser: user }; },
  updateAuthUI: () => calls.push(["authUI"]),
  clearUserMarksForLoggedOut: () => calls.push(["clearUserMarks"]),
  applyFavoritesResult: (result) => {
    calls.push(["applyFavorites", result]);
    state = { ...state, favorites: result.favorites, favoritesUpdatedAt: result.favoritesUpdatedAt };
  },
  applyDifficultsResult: (result) => {
    calls.push(["applyDifficults", result]);
    state = { ...state, difficults: result.difficults, difficultsUpdatedAt: result.difficultsUpdatedAt };
  },
  applyRealtimeFavoritesResult: (result) => calls.push(["applyRealtimeFavorites", result]),
  applyRealtimeDifficultsResult: (result) => calls.push(["applyRealtimeDifficults", result]),
  afterRealtimeUpdate: () => calls.push(["afterRealtime"]),
  afterLoginLoaded: () => calls.push(["afterLogin"]),
  notifyCloudSyncFailure: () => calls.push(["notify"])
});

controller.setupAuthListener();
await authHandler(null);
assert.deepStrictEqual(calls.slice(0, 2), [["authUI"], ["clearUserMarks"]]);

calls.length = 0;
await authHandler({ uid: "user-1" });
assert.deepStrictEqual(calls[0], ["authUI"]);
assert.deepStrictEqual(calls[1][0], "syncFavorites");
assert.deepStrictEqual(calls[2][0], "applyFavorites");
assert.deepStrictEqual(calls[3][0], "syncDifficults");
assert.deepStrictEqual(calls[4][0], "applyDifficults");
assert.deepStrictEqual(calls[5], ["subscribe", "portfolioUsers", "user-1"]);
assert.deepStrictEqual(calls.at(-1), ["afterLogin"]);

calls.length = 0;
await controller.saveFavoritesToCloud();
await controller.saveDifficultsToCloud();
assert.deepStrictEqual(calls[0][0], "saveFavorites");
assert.deepStrictEqual(calls[1][0], "saveDifficults");

console.log("All cloud sync controller tests passed.");
