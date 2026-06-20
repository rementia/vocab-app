export function createCloudSyncController({
  auth,
  db,
  collectionName,
  onAuthStateChanged,
  subscribeFavoritesRealtimeRemote,
  saveFavoritesToCloudRemote,
  saveDifficultsToCloudRemote,
  syncFavoritesWithCloud,
  syncDifficultsWithCloud,
  resolveFavoritesSnapshot,
  resolveDifficultsSnapshot,
  getState,
  setCurrentUser,
  updateAuthUI,
  clearUserMarksForLoggedOut,
  applyFavoritesResult,
  applyDifficultsResult,
  applyRealtimeFavoritesResult,
  applyRealtimeDifficultsResult,
  afterRealtimeUpdate,
  afterLoginLoaded,
  notifyCloudSyncFailure
}) {
  let favoritesUnsubscribe = null;

  function setupAuthListener() {
    onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      updateAuthUI();

      if (favoritesUnsubscribe) {
        favoritesUnsubscribe();
        favoritesUnsubscribe = null;
      }

      if (!user) {
        clearUserMarksForLoggedOut();
        return;
      }

      await loadFavoritesFromCloud();
      await loadDifficultsFromCloud();
      subscribeFavoritesRealtime();
      afterLoginLoaded();
    });
  }

  function subscribeFavoritesRealtime() {
    const { currentUser } = getState();
    if (!currentUser) return;

    favoritesUnsubscribe = subscribeFavoritesRealtimeRemote(db, collectionName, currentUser.uid, (snap) => {
      const state = getState();
      const result = resolveFavoritesSnapshot(snap, state.favoritesUpdatedAt);
      if (!result) return;

      applyRealtimeFavoritesResult(result);

      const difficultsResult = resolveDifficultsSnapshot(snap, state.difficultsUpdatedAt);
      if (difficultsResult) {
        applyRealtimeDifficultsResult(difficultsResult);
      }

      afterRealtimeUpdate();
    }, (error) => {
      console.error("クラウド購読失敗:", error);
      notifyCloudSyncFailure();
    });
  }

  async function loadFavoritesFromCloud() {
    const state = getState();
    if (!state.currentUser) return;

    try {
      const result = await syncFavoritesWithCloud(
        db,
        collectionName,
        state.currentUser.uid,
        state.favorites,
        state.favoritesUpdatedAt
      );

      applyFavoritesResult(result);
    } catch (error) {
      console.error("クラウド読み込み失敗:", error);
      notifyCloudSyncFailure();
    }
  }

  async function loadDifficultsFromCloud() {
    const state = getState();
    if (!state.currentUser) return;

    try {
      const result = await syncDifficultsWithCloud(
        db,
        collectionName,
        state.currentUser.uid,
        state.difficults,
        state.difficultsUpdatedAt
      );

      applyDifficultsResult(result);
    } catch (error) {
      console.error("クラウド読み込み失敗:", error);
      notifyCloudSyncFailure();
    }
  }

  async function saveFavoritesToCloud() {
    const state = getState();
    if (!state.currentUser) return;

    try {
      await saveFavoritesToCloudRemote(db, collectionName, state.currentUser.uid, state.favorites, state.favoritesUpdatedAt);
    } catch (error) {
      console.error("クラウド保存失敗:", error);
      notifyCloudSyncFailure();
    }
  }

  async function saveDifficultsToCloud() {
    const state = getState();
    if (!state.currentUser) return;

    try {
      await saveDifficultsToCloudRemote(db, collectionName, state.currentUser.uid, state.difficults, state.difficultsUpdatedAt);
    } catch (error) {
      console.error("クラウド保存失敗:", error);
      notifyCloudSyncFailure();
    }
  }

  return {
    loadDifficultsFromCloud,
    loadFavoritesFromCloud,
    saveDifficultsToCloud,
    saveFavoritesToCloud,
    setupAuthListener,
    subscribeFavoritesRealtime
  };
}
