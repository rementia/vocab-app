export const STORAGE_KEYS = {
  vol: "portfolio_tango_current_vol",
  mode: "portfolio_tango_current_mode",
  indexByVol: "portfolio_tango_index_by_vol",
  sidebarOpen: "portfolio_tango_sidebar_open",
  speechSync: "portfolio_tango_speech_sync",
  favorites: "portfolio_tango_favorites",
  favoritesUpdatedAt: "portfolio_tango_favorites_updated_at",
  difficults: "portfolio_tango_difficults",
  difficultsUpdatedAt: "portfolio_tango_difficults_updated_at",
  reviewScores: "portfolio_tango_review_scores",
  challengeMode: "portfolio_tango_challenge_mode",
  challengeTime: "portfolio_tango_challenge_time",
  displayTime: "portfolio_tango_display_time",
  translationMode: "portfolio_tango_translation_mode",
  multipleChoiceMode: "portfolio_tango_multiple_choice_mode",
  autoPlay: "portfolio_tango_auto_play",
  randomMode: "portfolio_tango_random_mode",
  frequencyMode: "portfolio_tango_frequency_mode"
};

let hasShownStorageWriteWarning = false;

function notifyStorageWriteFailure() {
  if (hasShownStorageWriteWarning) return;
  hasShownStorageWriteWarning = true;

  if (typeof window !== "undefined" && typeof window.alert === "function") {
    window.alert("ブラウザ保存に失敗しました。表示は続行できますが、再読み込み後に一部の状態が復元されない可能性があります。");
  }
}

export function safeSetItem(key, value) {
  try {
    localStorage.setItem(key, value);
  } catch (error) {
    console.warn(`localStorage write failed for ${key}:`, error);
    notifyStorageWriteFailure();
  }
}

export function safeGetItem(key) {
  try {
    return localStorage.getItem(key);
  } catch (error) {
    console.warn(`localStorage read failed for ${key}:`, error);
    return null;
  }
}

export function saveCurrentVol(value) {
  safeSetItem(STORAGE_KEYS.vol, value);
}

export function saveCurrentModeState(value) {
  safeSetItem(STORAGE_KEYS.mode, value);
}

export function saveIndexByVol(value) {
  safeSetItem(STORAGE_KEYS.indexByVol, JSON.stringify(value));
}

export function saveSidebarState(value) {
  safeSetItem(STORAGE_KEYS.sidebarOpen, String(value));
}

export function saveSpeechSyncState(value) {
  safeSetItem(STORAGE_KEYS.speechSync, String(value));
}

export function saveFavoritesToLocalOnly(value) {
  safeSetItem(STORAGE_KEYS.favorites, JSON.stringify(value));
}

export function saveFavoritesUpdatedAt(value) {
  safeSetItem(STORAGE_KEYS.favoritesUpdatedAt, String(value));
}

export function saveDifficultsToLocalOnly(value) {
  safeSetItem(STORAGE_KEYS.difficults, JSON.stringify(value));
}

export function saveDifficultsUpdatedAt(value) {
  safeSetItem(STORAGE_KEYS.difficultsUpdatedAt, String(value));
}

export function saveReviewScoresToLocalOnly(value) {
  safeSetItem(STORAGE_KEYS.reviewScores, JSON.stringify(value));
}

export function saveChallengeModeState(value) {
  safeSetItem(STORAGE_KEYS.challengeMode, String(value));
}

export function saveChallengeTimeState(value) {
  safeSetItem(STORAGE_KEYS.challengeTime, String(value));
}

export function saveDisplayTimeState(value) {
  safeSetItem(STORAGE_KEYS.displayTime, String(value));
}

export function saveTranslationModeState(value) {
  safeSetItem(STORAGE_KEYS.translationMode, String(value));
}

export function saveMultipleChoiceModeState(value) {
  safeSetItem(STORAGE_KEYS.multipleChoiceMode, String(value));
}

export function saveAutoPlayState(value) {
  safeSetItem(STORAGE_KEYS.autoPlay, String(value));
}

export function saveRandomModeState(value) {
  safeSetItem(STORAGE_KEYS.randomMode, String(value));
}

export function saveFrequencyModeState(value) {
  safeSetItem(STORAGE_KEYS.frequencyMode, String(value));
}
