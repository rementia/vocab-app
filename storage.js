export const STORAGE_KEYS = {
  vol: "portfolio_tango_current_vol",
  mode: "portfolio_tango_current_mode",
  indexByVol: "portfolio_tango_index_by_vol",
  sidebarOpen: "portfolio_tango_sidebar_open",
  autoSpeak: "portfolio_tango_auto_speak",
  favorites: "portfolio_tango_favorites",
  favoritesUpdatedAt: "portfolio_tango_favorites_updated_at",
  difficults: "portfolio_tango_difficults",
  challengeMode: "portfolio_tango_challenge_mode",
  challengeTime: "portfolio_tango_challenge_time",
  randomMode: "portfolio_tango_random_mode"
};

export function safeSetItem(key, value) {
  try {
    localStorage.setItem(key, value);
  } catch (error) {
    console.warn(`localStorage write failed for ${key}:`, error);
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

export function saveAutoSpeakState(value) {
  safeSetItem(STORAGE_KEYS.autoSpeak, String(value));
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

export function saveChallengeModeState(value) {
  safeSetItem(STORAGE_KEYS.challengeMode, String(value));
}

export function saveChallengeTimeState(value) {
  safeSetItem(STORAGE_KEYS.challengeTime, String(value));
}

export function saveRandomModeState(value) {
  safeSetItem(STORAGE_KEYS.randomMode, String(value));
}
