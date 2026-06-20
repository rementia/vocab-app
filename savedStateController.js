import { STORAGE_KEYS, safeGetItem, saveAutoPlayState } from "./storage.js";
import { normalizeWordRecordMap } from "./wordIdentity.js";

function parseJsonValue(value, fallback, normalize = (item) => item) {
  if (!value) return fallback;

  try {
    return normalize(JSON.parse(value));
  } catch (error) {
    console.warn("saved state restore failed", error);
    return fallback;
  }
}

function parseTimestamp(value) {
  return value ? Number(value) || 0 : 0;
}

function parseBoundedTime(value, fallback) {
  if (value === null) return fallback;

  const parsedTime = Number(value);
  return Number.isNaN(parsedTime)
    ? fallback
    : Math.min(Math.max(parsedTime, 1000), 5000);
}

export function loadSavedState({ volOrder, defaultSidebarOpen, initialIndexByVol }) {
  const savedVol = safeGetItem(STORAGE_KEYS.vol);
  const savedMode = safeGetItem(STORAGE_KEYS.mode);
  const savedAutoPlay = safeGetItem(STORAGE_KEYS.autoPlay);

  if (savedAutoPlay !== null) {
    // 起動直後の意図しない自動再生を避けるため、保存値に関係なくOFFへ戻す
    saveAutoPlayState("off");
  }

  return {
    currentVol: savedVol && volOrder.includes(savedVol) ? savedVol : null,
    currentMode: savedMode === "favorites" || savedMode === "difficults" ? savedMode : null,
    sidebarOpen: parseBooleanValue(safeGetItem(STORAGE_KEYS.sidebarOpen), defaultSidebarOpen),
    speechSync: parseBooleanValue(safeGetItem(STORAGE_KEYS.speechSync), false),
    indexByVol: parseJsonValue(safeGetItem(STORAGE_KEYS.indexByVol), initialIndexByVol),
    favorites: parseJsonValue(safeGetItem(STORAGE_KEYS.favorites), {}, normalizeWordRecordMap),
    difficults: parseJsonValue(safeGetItem(STORAGE_KEYS.difficults), {}, normalizeWordRecordMap),
    reviewScores: parseJsonValue(safeGetItem(STORAGE_KEYS.reviewScores), {}, normalizeWordRecordMap),
    favoritesUpdatedAt: parseTimestamp(safeGetItem(STORAGE_KEYS.favoritesUpdatedAt)),
    difficultsUpdatedAt: parseTimestamp(safeGetItem(STORAGE_KEYS.difficultsUpdatedAt)),
    challengeMode: parseBooleanValue(safeGetItem(STORAGE_KEYS.challengeMode), false),
    challengeTime: parseBoundedTime(safeGetItem(STORAGE_KEYS.challengeTime), 1500),
    displayTime: parseBoundedTime(safeGetItem(STORAGE_KEYS.displayTime), 1500),
    translationMode: parseBooleanValue(safeGetItem(STORAGE_KEYS.translationMode), false),
    multipleChoiceMode: parseBooleanValue(safeGetItem(STORAGE_KEYS.multipleChoiceMode), false),
    randomMode: parseBooleanValue(safeGetItem(STORAGE_KEYS.randomMode), false),
    frequencyMode: parseBooleanValue(safeGetItem(STORAGE_KEYS.frequencyMode), false)
  };
}

function parseBooleanValue(value, fallback) {
  return value === null ? fallback : value === "true";
}
