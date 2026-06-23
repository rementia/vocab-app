import { sortByReviewScore } from "./reviewManager.js";

export function getWordOrderMode({ randomMode, frequencyMode }) {
  if (randomMode && frequencyMode) return "frequency-random";
  if (frequencyMode) return "frequency";
  if (randomMode) return "random";
  return "";
}

export function makeWordOrderCacheKey({ orderMode, currentMode, currentVol }) {
  const scope = currentMode === "favorites" || currentMode === "difficults"
    ? `${currentMode}:all`
    : `vol:${currentVol}`;
  return `${orderMode}:${scope}`;
}

export function shouldRebuildOrderAtCycleEnd({ nextIndex, randomMode, frequencyMode }) {
  return nextIndex === 0 && (randomMode || frequencyMode);
}

export function shuffleArray(array, random = Math.random) {
  const copied = [...array];
  for (let i = copied.length - 1; i > 0; i -= 1) {
    const j = Math.floor(random() * (i + 1));
    [copied[i], copied[j]] = [copied[j], copied[i]];
  }
  return copied;
}

export function isWordOrderCacheValid(cachedWords, baseWords) {
  return (
    Array.isArray(cachedWords) &&
    cachedWords.length === baseWords.length &&
    cachedWords.every((item) => baseWords.some((base) => base.id === item.id))
  );
}

export function getOrderedWords({
  baseWords,
  orderMode,
  cache,
  cacheKey,
  getWeight
}) {
  if (!orderMode) return baseWords;

  if (!isWordOrderCacheValid(cache[cacheKey], baseWords)) {
    cache[cacheKey] = orderMode === "random"
      ? shuffleArray(baseWords)
      : sortByReviewScore(baseWords, getWeight, { randomizeTies: orderMode === "frequency-random" });
  }

  return cache[cacheKey];
}
