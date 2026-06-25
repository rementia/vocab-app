import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.12.0/firebase-auth.js";
import { fetchWordsByVol, fetchWordsForVol } from './data.js';
import { getDomElements } from './dom.js';
import { auth, db, provider } from './firebaseClient.js';
import {
  FAVORITES_COLLECTION,
  volOrder,
  createInitialIndexByVol,
  createInitialWordsByVol
} from './state.js';
import { signInWithGoogle, signOutUser } from './auth.js';
import {
  saveCurrentVol,
  saveCurrentModeState,
  saveIndexByVol,
  saveSidebarState,
  saveSpeechSyncState,
  saveFavoritesToLocalOnly,
  saveFavoritesUpdatedAt,
  saveDifficultsToLocalOnly,
  saveDifficultsUpdatedAt,
  saveReviewScoresToLocalOnly,
  saveChallengeModeState,
  saveChallengeTimeState,
  saveDisplayTimeState,
  saveTranslationModeState,
  saveMultipleChoiceModeState,
  saveAutoPlayState,
  saveRandomModeState,
  saveFrequencyModeState
} from './storage.js';
import {
  renderApp,
  renderCurrentWord as renderCurrentWordUI,
  updateSpeechSyncButton as uiUpdateSpeechSyncButton,
  updateChallengeButton as uiUpdateChallengeButton,
  updateRecallTimeControl as uiUpdateRecallTimeControl,
  updateTranslationButton as uiUpdateTranslationButton,
  updateMultipleChoiceButton as uiUpdateMultipleChoiceButton,
  updateAutoPlayButton as uiUpdateAutoPlayButton,
  updateRandomButton as uiUpdateRandomButton,
  updateFrequencyButton as uiUpdateFrequencyButton,
  updateFavoriteToggleButton as uiUpdateFavoriteToggleButton,
  updateDifficultToggleButton as uiUpdateDifficultToggleButton,
  applySidebarState as uiApplySidebarState,
  updateAuthUI as uiUpdateAuthUI
} from './ui.js';
import {
  buildFavoriteEntries,
  isFavorite,
  migrateLegacyFavoriteRecords,
  toggleFavoriteCurrentWord as toggleFavoriteCurrentWordManager,
  loadFavoritesMode as loadFavoritesModeManager
} from './favoritesManager.js';
import {
  buildDifficultEntries,
  isDifficult,
  migrateLegacyDifficultRecords,
  toggleDifficultCurrentWord as toggleDifficultCurrentWordManager,
  loadDifficultsMode as loadDifficultsModeManager
} from './difficultsManager.js';
import {
  getReviewWeight,
  migrateLegacyReviewScores,
  recordReviewAnswer
} from './reviewManager.js';
import { clampIndex } from './wordList.js';
import {
  getOrderedWords,
  getWordOrderMode,
  makeWordOrderCacheKey,
  shouldRebuildOrderAtCycleEnd
} from './wordOrderService.js';
import { loadSavedState as loadSavedStateFromStorage } from './savedStateController.js';
import { createAutoPlayController } from './autoPlayController.js';
import { createSpeechSyncController } from './speechSyncController.js';
import { createCloudSyncController } from './cloudSyncController.js';
import {
  bindKeyboardEvents,
  bindTouchEvents,
  isSwipeAllowedTarget,
  handleViewportChange,
  resetSwipeElementState
} from './events.js';
import {
  initNavigation,
  moveToIndex as navMoveToIndex,
  getRandomPrevIndexFromHistory as navGetRandomPrevIndexFromHistory,
  getRandomNextIndexFromHistory as navGetRandomNextIndexFromHistory,
  clearNavigationHistory as navClearNavigationHistory,
  getHistoryBackStack,
  getHistoryForwardStack
} from './navigation.js';
import {
  initPronunciation,
  updateSpeechButtonAvailability,
  speakWord,
  loadPronunciation,
  unlockPronunciationAudioOnce
} from './pronunciation.js';
import {
  buildMultipleChoiceQuestion,
  getMultipleChoiceDirection
} from './multipleChoice.js';
import { getNextSearchResultIndex } from './searchController.js';
import { getReloadedIndex } from './wordReloadService.js';
import { createReloadStatusController } from './reloadStatusService.js';
import {
  loadFavoritesFromCloudRemote,
  subscribeFavoritesRealtimeRemote,
  saveFavoritesToCloudRemote,
  saveDifficultsToCloudRemote,
  syncFavoritesWithCloud,
  syncDifficultsWithCloud,
  resolveFavoritesSnapshot,
  resolveDifficultsSnapshot
} from './favorites.js';
const {
  searchInputEl,
  reloadWordsBtnEl,
  reloadWordsStatusEl,
  listEl,
  sidebarEl,
  wordSlideCardEl,
  wordEl,
  meaningEl,
  progressEl,
  pronunciationEl,
  prevHintEl,
  nextHintEl,
  currentEl,
  recallTimeControlEl,
  displayTimeControlEl,
  timeSlider,
  timeValue,
  displayTimeSlider,
  displayTimeValue,
  favoriteToggleBtnEl,
  difficultToggleBtnEl,
  favoriteListBtnEl,
  difficultListBtnEl,
  speechSyncBtnEl,
  challengeBtnEl,
  translationBtnEl,
  multipleChoiceBtnEl,
  multipleChoicePanelEl,
  multipleChoiceQuestionEl,
  multipleChoiceOptionsEl,
  multipleChoiceFeedbackEl,
  autoPlayBtnEl,
  randomBtnEl,
  frequencyBtnEl,
  loginBtnEl,
  logoutBtnEl,
  toggleSidebarBtnEl,
  prevWordBtnEl,
  nextWordBtnEl,
  speakWordBtnEl,
  volButtons
} = getDomElements();

let currentUser = null;

let allWordsByVol = createInitialWordsByVol();

let words = [];
let index = 0;
let currentVol = "vol1";
let currentMode = "vol";
let sidebarOpen = true;
let favorites = {};
let difficults = {};
let reviewScores = {};
let favoritesUpdatedAt = 0;
let difficultsUpdatedAt = 0;
let challengeMode = false;
let challengeTime = 1500;
let displayTime = 1500;
let translationMode = false;
let multipleChoiceMode = false;
let randomMode = false;
let frequencyMode = false;

let meaningRevealTimer = null;
let wordOrderUpdatePending = false;
let hasFinishedInitialLoading = false;
let hasShownCloudSyncWarning = false;
let multipleChoiceQuestion = null;
let multipleChoiceAnswer = null;
let multipleChoiceRevealedOptionIndexes = new Set();

let listNeedsRebuild = true;
let renderedListVersion = "";
let listVersion = 0;
let favoritesVersion = 0;
let difficultsVersion = 0;
let reviewScoresVersion = 0;
let searchQuery = "";
let isReloadingWords = false;

let indexByVol = createInitialIndexByVol();

const reloadWordsStatus = createReloadStatusController({
  setStatus: (message) => {
    if (reloadWordsStatusEl) reloadWordsStatusEl.textContent = message;
  },
  setTimeoutFn: window.setTimeout.bind(window),
  clearTimeoutFn: window.clearTimeout.bind(window)
});

const SPEECH_SYNC_DELAY_MS = 260;

const autoPlayController = createAutoPlayController({
  getState: () => ({
    currentMode,
    currentVol,
    index,
    words,
    challengeMode,
    challengeTime,
    displayTime
  }),
  saveAutoPlayState,
  updateAutoPlayButton,
  nextWord,
  speakCurrentWordForSpeechSync,
  revealCurrentMeaningImmediately,
  isSkipIgnoredTarget: isAutoPlaySkipIgnoredTarget
});

const speechSyncController = createSpeechSyncController({
  delayMs: SPEECH_SYNC_DELAY_MS,
  saveSpeechSyncState,
  updateSpeechSyncButton,
  speakWord,
  shouldBlockSpeech: () => multipleChoiceMode && !multipleChoiceAnswer,
  unlockPronunciationAudio: unlockPronunciationAudioOnce
});

const cloudSyncController = createCloudSyncController({
  auth,
  db,
  collectionName: FAVORITES_COLLECTION,
  onAuthStateChanged,
  subscribeFavoritesRealtimeRemote,
  saveFavoritesToCloudRemote,
  saveDifficultsToCloudRemote,
  syncFavoritesWithCloud,
  syncDifficultsWithCloud,
  resolveFavoritesSnapshot,
  resolveDifficultsSnapshot,
  getState: () => ({
    currentUser,
    favorites,
    favoritesUpdatedAt,
    difficults,
    difficultsUpdatedAt
  }),
  setCurrentUser: (user) => { currentUser = user; },
  updateAuthUI: () => uiUpdateAuthUI(uiContext),
  clearUserMarksForLoggedOut,
  applyFavoritesResult,
  applyDifficultsResult,
  applyRealtimeFavoritesResult,
  applyRealtimeDifficultsResult,
  afterRealtimeUpdate,
  afterLoginLoaded,
  notifyCloudSyncFailure
});

const uiContext = {
  getState: () => ({
    words,
    currentMode,
    currentVol,
    randomMode,
    frequencyMode,
    listNeedsRebuild,
    renderedListVersion,
    listVersion,
    favoritesVersion,
    difficultsVersion,
    reviewScoresVersion,
    searchQuery,
    index,
    challengeMode,
    challengeTime,
    displayTime,
    translationMode,
    multipleChoiceMode,
    multipleChoiceAnswer,
    multipleChoiceRevealedOptionIndexes: [...multipleChoiceRevealedOptionIndexes],
    autoPlayMode: autoPlayController.getMode(),
    historyBackStack: getHistoryBackStack(),
    historyForwardStack: getHistoryForwardStack(),
    sidebarOpen,
    speechSync: speechSyncController.isEnabled(),
    currentUser
  }),
  dom: {
    searchInputEl,
    listEl,
    sidebarEl,
    wordEl,
    meaningEl,
    progressEl,
    pronunciationEl,
    prevHintEl,
    nextHintEl,
    currentEl,
    recallTimeControlEl,
    displayTimeControlEl,
    displayTimeSlider,
    displayTimeValue,
    favoriteToggleBtnEl,
    difficultToggleBtnEl,
    favoriteListBtnEl,
    difficultListBtnEl,
    speechSyncBtnEl,
    challengeBtnEl,
    translationBtnEl,
    multipleChoiceBtnEl,
    multipleChoicePanelEl,
    multipleChoiceQuestionEl,
    multipleChoiceOptionsEl,
    multipleChoiceFeedbackEl,
    autoPlayBtnEl,
    randomBtnEl,
    frequencyBtnEl,
    loginBtnEl,
    logoutBtnEl,
    toggleSidebarBtnEl,
    volButtons
  },
  callbacks: {
    isFavorite: (item) => isFavorite(favorites, item),
    isDifficult: (item) => isDifficult(difficults, item),
    getMultipleChoiceQuestion,
    getCurrentWord,
    persistCurrentIndex,
    loadPronunciation,
    clearMeaningRevealTimer,
    clearSpeechSyncTimer,
    setMeaningRevealTimer,
    setListNeedsRebuild,
    setRenderedListVersion,
    setSearchQuery
  }
};

let wordOrderCache = {};

async function init() {
  loadSavedState();
  initNavigation({
    getIndex: () => index,
    setIndex: (n) => { index = n; },
    renderCurrentWord,
    scheduleSpeechSync,
    getWordsLength: () => words.length
  });
  bindTouchEvents({ prevWord, nextWord, isSwipeAllowedTarget, swipeElement: wordSlideCardEl });
  bindUIEvents();
  bindKeyboardEvents({
    prevWord,
    nextWord,
    speakWord: handleSpeakCurrentWord,
    handleToggleFavoriteCurrentWord,
    handleToggleDifficultCurrentWord,
    focusSearch,
    clearSearch,
    selectNextSearchResult,
    selectPreviousSearchResult,
    closeSidebar,
    toggleSidebar,
    toggleRandomMode
  });
  setupAuthListener();
  initPronunciation({
    el: pronunciationEl,
    getCurrentWord
  });
  updateSpeechButtonAvailability(speakWordBtnEl);

  window.addEventListener("resize", handleViewportResize);
  window.addEventListener("orientationchange", handleViewportResize);

  if (window.visualViewport) {
    window.visualViewport.addEventListener("resize", handleViewportResize);
  }

  handleViewportResize();

  if (currentMode === "favorites") {
    await handleLoadFavoritesMode();
    saveSidebarState(sidebarOpen);
    finishInitialLoading();
    scheduleSpeechSyncAfterRender();
    scheduleAutoPlayAfterRender();
  } else if (currentMode === "difficults") {
    await handleLoadDifficultsMode();
    saveSidebarState(sidebarOpen);
    finishInitialLoading();
    scheduleSpeechSyncAfterRender();
    scheduleAutoPlayAfterRender();
  } else {
    // 初回通常モード時はシートを読み込んで初期表示を完了する
    await loadSheet(currentVol);
  }
}

const handleViewportResize = handleViewportChange(renderLayout);

async function handleLoadFavoritesMode() {
  if (currentMode !== "favorites" && isAutoPlayActive()) {
    stopAutoPlay();
  }
  const result = await loadFavoritesModeManager(
    { allWordsByVol, currentMode, currentVol, indexByVol, favorites, words, randomMode, frequencyMode },
    {
      ensureAllVolumesLoaded,
      saveCurrentModeState,
      saveRandomModeState,
      saveFrequencyModeState,
      clearNavigationHistory: navClearNavigationHistory,
      applyWordOrder,
      requestListRebuild,
      render,
      updateRandomButton,
      updateFrequencyButton,
      updateFavoriteToggleButton,
      getWords: () => words,
      getCurrentWord,
      setCurrentMode: (mode) => { currentMode = mode; },
      setRandomMode: (value) => { randomMode = value; },
      setFrequencyMode: (value) => { frequencyMode = value; }
    },
    volOrder
  );

  if (result) {
    currentMode = result.currentMode;
    index = result.index;
    if (typeof result.randomMode === "boolean") {
      randomMode = result.randomMode;
    }
    if (typeof result.frequencyMode === "boolean") {
      frequencyMode = result.frequencyMode;
    }
    scheduleSpeechSyncAfterRender();
    scheduleAutoPlayAfterRender();
  }
}


async function handleLoadDifficultsMode() {
  if (currentMode !== "difficults" && isAutoPlayActive()) {
    stopAutoPlay();
  }
  const result = await loadDifficultsModeManager(
    { allWordsByVol, currentMode, indexByVol, difficults, words, randomMode, frequencyMode },
    {
      ensureAllVolumesLoaded,
      saveCurrentModeState,
      saveRandomModeState,
      saveFrequencyModeState,
      clearNavigationHistory: navClearNavigationHistory,
      applyWordOrder,
      requestListRebuild,
      render,
      updateRandomButton,
      updateFrequencyButton,
      updateDifficultToggleButton,
      getWords: () => words,
      setCurrentMode: (mode) => { currentMode = mode; },
      setRandomMode: (value) => { randomMode = value; },
      setFrequencyMode: (value) => { frequencyMode = value; }
    },
    volOrder
  );

  if (result) {
    currentMode = result.currentMode;
    index = result.index;
    if (typeof result.randomMode === "boolean") {
      randomMode = result.randomMode;
    }
    if (typeof result.frequencyMode === "boolean") {
      frequencyMode = result.frequencyMode;
    }
    scheduleSpeechSyncAfterRender();
    scheduleAutoPlayAfterRender();
  }
}
function handleToggleFavoriteCurrentWord() {
  if (!currentUser) {
    updateFavoriteToggleButton();
    return;
  }

  const result = toggleFavoriteCurrentWordManager(
    {
      favorites,
      favoritesUpdatedAt,
      favoritesVersion,
      currentMode,
      currentUser,
      words,
      index,
      indexByVol
    },
    {
      getCurrentWord,
      getWords: () => words,
      saveFavoritesToLocalOnly,
      saveFavoritesUpdatedAt,
      clearWordOrderCache,
      requestListRebuild,
      updateFavoriteToggleButton,
      saveFavoritesToCloud,
      applyWordOrder,
      saveIndexByVol,
      render
    }
  );

  if (result) {
    if (typeof result.index === "number") index = result.index;
    if (result.currentMode) currentMode = result.currentMode;
    if (result.indexByVol) indexByVol = result.indexByVol;
    if (typeof result.favoritesUpdatedAt === "number") favoritesUpdatedAt = result.favoritesUpdatedAt;
    if (typeof result.favoritesVersion === "number") favoritesVersion = result.favoritesVersion;
    scheduleSpeechSyncAfterRender();
    scheduleAutoPlayAfterRender();
  }
}


function handleToggleDifficultCurrentWord() {
  if (!currentUser) {
    updateDifficultToggleButton();
    return;
  }

  const result = toggleDifficultCurrentWordManager(
    {
      difficults,
      difficultsUpdatedAt,
      difficultsVersion,
      currentMode,
      currentUser,
      words,
      index,
      indexByVol
    },
    {
      getCurrentWord,
      getWords: () => words,
      saveDifficultsToLocalOnly,
      saveDifficultsUpdatedAt,
      clearWordOrderCache,
      requestListRebuild,
      updateDifficultToggleButton,
      saveDifficultsToCloud,
      applyWordOrder,
      saveIndexByVol,
      render
    }
  );

  if (result) {
    if (typeof result.index === "number") index = result.index;
    if (result.indexByVol) indexByVol = result.indexByVol;
    if (typeof result.difficultsUpdatedAt === "number") difficultsUpdatedAt = result.difficultsUpdatedAt;
    if (typeof result.difficultsVersion === "number") difficultsVersion = result.difficultsVersion;
    scheduleSpeechSyncAfterRender();
    scheduleAutoPlayAfterRender();
  }
}

function finishReviewStatsChange() {
  reviewScoresVersion += 1;
  saveReviewScoresToLocalOnly(reviewScores);
  clearWordOrderCache();

  renderLayout();
}

function getMultipleChoiceQuestion() {
  if (!multipleChoiceMode) return null;

  const current = getCurrentWord();
  if (!current) {
    multipleChoiceQuestion = null;
    multipleChoiceAnswer = null;
    multipleChoiceRevealedOptionIndexes.clear();
    return null;
  }

  const direction = getMultipleChoiceDirection({ translationMode });
  if (
    !multipleChoiceQuestion ||
    multipleChoiceQuestion.wordId !== current.id ||
    multipleChoiceQuestion.direction !== direction
  ) {
    multipleChoiceQuestion = buildMultipleChoiceQuestion({
      current,
      allWordsByVol,
      volOrder,
      translationMode
    });
    multipleChoiceAnswer = null;
    multipleChoiceRevealedOptionIndexes.clear();
  }

  return multipleChoiceQuestion;
}

function handleMultipleChoiceOptionClick(event) {
  const button = event.target instanceof Element
    ? event.target.closest(".multiple-choice-option")
    : null;
  if (!(button instanceof HTMLElement)) return;

  const question = getMultipleChoiceQuestion();
  const current = getCurrentWord();
  if (!question || !current) return;

  const choiceIndex = Number(button.dataset.choiceIndex);
  const selectedOption = question.options[choiceIndex];
  if (!selectedOption) return;

  if (multipleChoiceAnswer) {
    if (!selectedOption.isCorrect) {
      if (multipleChoiceRevealedOptionIndexes.has(choiceIndex)) {
        multipleChoiceRevealedOptionIndexes.delete(choiceIndex);
      } else {
        multipleChoiceRevealedOptionIndexes.add(choiceIndex);
      }
      renderCurrentWord();
    }
    return;
  }

  multipleChoiceAnswer = {
    wordId: current.id,
    selectedText: selectedOption.text,
    correctText: question.correctText,
    isCorrect: selectedOption.isCorrect
  };

  recordReviewAnswer(reviewScores, current, selectedOption.isCorrect);
  finishReviewStatsChange();
  scheduleSpeechSync();
}
function finishInitialLoading() {
  if (hasFinishedInitialLoading) return;
  hasFinishedInitialLoading = true;

  requestAnimationFrame(() => {
    document.body.classList.remove("loading");

    requestAnimationFrame(() => {
      render();
    });
  });
}

function bindUIEvents() {
  bindAuthEvents();
  bindModeEvents();
  bindWordMarkEvents();
  bindNavigationEvents();
  bindSearchEvents();
  bindTimeControlEvents();
  bindVolumeEvents();
  bindListEvents();
}

function bindAuthEvents() {
  loginBtnEl?.addEventListener("click", () => signInWithGoogle(auth, provider));
  logoutBtnEl?.addEventListener("click", () => signOutUser(auth));
}

function bindModeEvents() {
  toggleSidebarBtnEl?.addEventListener("click", toggleSidebar);
  speechSyncBtnEl?.addEventListener("click", toggleSpeechSync);
  challengeBtnEl?.addEventListener("click", toggleChallengeMode);
  translationBtnEl?.addEventListener("click", toggleTranslationMode);
  multipleChoiceBtnEl?.addEventListener("click", toggleMultipleChoiceMode);
  autoPlayBtnEl?.addEventListener("click", toggleAutoPlay);
  randomBtnEl?.addEventListener("click", toggleRandomMode);
  frequencyBtnEl?.addEventListener("click", toggleFrequencyMode);
  favoriteListBtnEl?.addEventListener("click", handleLoadFavoritesMode);
  difficultListBtnEl?.addEventListener("click", handleLoadDifficultsMode);
}

function bindWordMarkEvents() {
  favoriteToggleBtnEl?.addEventListener("click", handleToggleFavoriteCurrentWord);
  difficultToggleBtnEl?.addEventListener("click", handleToggleDifficultCurrentWord);
}

function bindNavigationEvents() {
  prevWordBtnEl?.addEventListener("click", prevWord);
  nextWordBtnEl?.addEventListener("click", nextWord);
  speakWordBtnEl?.addEventListener("click", handleSpeakCurrentWord);
  multipleChoiceOptionsEl?.addEventListener("click", handleMultipleChoiceOptionClick);
  document.querySelector(".center-box")?.addEventListener("click", handleAutoPlaySkipRequest);
}

function bindSearchEvents() {
  searchInputEl?.addEventListener("input", () => {
    setSearchQuery(searchInputEl.value);
    requestListRebuild();
    renderLayout();
  });
  reloadWordsBtnEl?.addEventListener("click", handleReloadWords);
}

function bindTimeControlEvents() {
  if (timeSlider && timeValue) {
    setSecondsSliderValue(timeSlider, timeValue, challengeTime);

    timeSlider.addEventListener("input", () => {
      const seconds = readSliderSeconds(timeSlider);
      challengeTime = seconds * 1000;
      timeValue.textContent = formatSeconds(seconds);
      saveChallengeTimeState(challengeTime);

      if (challengeMode && !isAutoPlayActive()) {
        renderCurrentWord();
      }
    });
  }

  if (displayTimeSlider && displayTimeValue) {
    setSecondsSliderValue(displayTimeSlider, displayTimeValue, displayTime);

    displayTimeSlider.addEventListener("input", () => {
      const seconds = readSliderSeconds(displayTimeSlider);
      displayTime = seconds * 1000;
      displayTimeValue.textContent = formatSeconds(seconds);
      saveDisplayTimeState(displayTime);
    });
  }
}

function bindVolumeEvents() {
  volButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const volName = button.dataset.vol;
      if (volName) {
        loadSheet(volName);
      }
    });
  });
}

function bindListEvents() {
  listEl?.addEventListener("click", (event) => {
    const target = event.target instanceof Element ? event.target.closest(".word-item") : null;
    const nextIndex = readWordItemIndex(target);
    if (nextIndex === null) return;

    navMoveToIndex(nextIndex, { pushHistory: true });
    scheduleAutoPlayAfterRender();
  });
}

function notifyCloudSyncFailure() {
  if (hasShownCloudSyncWarning) return;
  hasShownCloudSyncWarning = true;
  alert("クラウド同期に失敗しました。ローカル表示は継続します。通信状態やログイン状態を確認してください。");
}

function setSecondsSliderValue(slider, label, milliseconds) {
  const seconds = Math.min(milliseconds / 1000, Number(slider.max));
  slider.value = seconds;
  label.textContent = formatSeconds(seconds);
}

function readSliderSeconds(slider) {
  return parseFloat(slider.value);
}

function formatSeconds(seconds) {
  return seconds.toFixed(1);
}

function readWordItemIndex(item) {
  if (!(item instanceof HTMLElement)) return null;

  const itemIndex = Number(item.dataset.index);
  return Number.isNaN(itemIndex) ? null : itemIndex;
}

function getDefaultSidebarOpen() {
  return !window.matchMedia?.("(pointer: coarse)").matches;
}
function loadSavedState() {
  const savedState = loadSavedStateFromStorage({
    volOrder,
    defaultSidebarOpen: getDefaultSidebarOpen(),
    initialIndexByVol: indexByVol
  });

  if (savedState.currentVol) currentVol = savedState.currentVol;
  if (savedState.currentMode) currentMode = savedState.currentMode;
  sidebarOpen = savedState.sidebarOpen;
  speechSyncController.setEnabled(savedState.speechSync);
  indexByVol = { ...indexByVol, ...savedState.indexByVol };
  favorites = savedState.favorites;
  difficults = savedState.difficults;
  reviewScores = savedState.reviewScores;
  favoritesUpdatedAt = savedState.favoritesUpdatedAt;
  difficultsUpdatedAt = savedState.difficultsUpdatedAt;
  challengeMode = savedState.challengeMode;
  challengeTime = savedState.challengeTime;
  displayTime = savedState.displayTime;
  translationMode = savedState.translationMode;
  multipleChoiceMode = savedState.multipleChoiceMode;
  randomMode = savedState.randomMode;
  frequencyMode = savedState.frequencyMode;

  updateSpeechSyncButton();
  updateChallengeButton();
  updateTranslationButton();
  updateMultipleChoiceButton();
  updateAutoPlayButton();
  updateRandomButton();
  updateFrequencyButton();
  applySidebarState();
}

function setupAuthListener() {
  cloudSyncController.setupAuthListener();
}

function clearUserMarksForLoggedOut() {
  favorites = {};
  difficults = {};
  favoritesUpdatedAt = 0;
  difficultsUpdatedAt = 0;
  favoritesVersion += 1;
  difficultsVersion += 1;
  clearWordOrderCache();
  requestListRebuild();
  render();
}

function applyFavoritesResult(result) {
  favorites = result.favorites;
  favoritesUpdatedAt = result.favoritesUpdatedAt;
  favoritesVersion += 1;
  saveFavoritesToLocalOnly(favorites);
  saveFavoritesUpdatedAt(favoritesUpdatedAt);
  void migrateLegacyUserRecordsForLoadedWords();
}

function applyDifficultsResult(result) {
  difficults = result.difficults;
  difficultsUpdatedAt = result.difficultsUpdatedAt;
  difficultsVersion += 1;
  saveDifficultsToLocalOnly(difficults);
  saveDifficultsUpdatedAt(difficultsUpdatedAt);
  void migrateLegacyUserRecordsForLoadedWords();
}

function applyRealtimeFavoritesResult(result) {
  applyFavoritesResult(result);
  clearWordOrderCache();
  requestListRebuild();

  if (currentMode === "favorites") {
    applyWordOrder(false);
    index = Math.min(index, Math.max(words.length - 1, 0));
  }
}

function applyRealtimeDifficultsResult(result) {
  applyDifficultsResult(result);
  clearWordOrderCache();
  requestListRebuild();

  if (currentMode === "difficults") {
    applyWordOrder(false);
    index = Math.min(index, Math.max(words.length - 1, 0));
  }
}

function afterRealtimeUpdate() {
  render();
  scheduleSpeechSyncAfterRender();
  scheduleAutoPlayAfterRender();
}

function afterLoginLoaded() {
  requestListRebuild();
  render();
}

function subscribeFavoritesRealtime() {
  cloudSyncController.subscribeFavoritesRealtime();
}

async function loadFavoritesFromCloud() {
  await cloudSyncController.loadFavoritesFromCloud();
}

async function loadDifficultsFromCloud() {
  await cloudSyncController.loadDifficultsFromCloud();
}

async function saveFavoritesToCloud() {
  await cloudSyncController.saveFavoritesToCloud();
}

async function saveDifficultsToCloud() {
  await cloudSyncController.saveDifficultsToCloud();
}

async function migrateLegacyUserRecordsForLoadedWords() {
  const favoritesResult = migrateLegacyFavoriteRecords(favorites, allWordsByVol);
  const difficultsResult = migrateLegacyDifficultRecords(difficults, allWordsByVol);
  const reviewScoresResult = migrateLegacyReviewScores(reviewScores, allWordsByVol);

  if (!favoritesResult.changed && !difficultsResult.changed && !reviewScoresResult.changed) {
    return;
  }

  if (favoritesResult.changed) {
    favoritesUpdatedAt = Date.now();
    favoritesVersion += 1;
    saveFavoritesToLocalOnly(favorites);
    saveFavoritesUpdatedAt(favoritesUpdatedAt);
    if (currentUser) await saveFavoritesToCloud();
  }

  if (difficultsResult.changed) {
    difficultsUpdatedAt = Date.now();
    difficultsVersion += 1;
    saveDifficultsToLocalOnly(difficults);
    saveDifficultsUpdatedAt(difficultsUpdatedAt);
    if (currentUser) await saveDifficultsToCloud();
  }

  if (reviewScoresResult.changed) {
    reviewScoresVersion += 1;
    saveReviewScoresToLocalOnly(reviewScores);
  }

  clearWordOrderCache();
  requestListRebuild();
}

async function ensureVolLoaded(volName) {
  if (!allWordsByVol[volName] || allWordsByVol[volName].length === 0) {
    allWordsByVol[volName] = await fetchWordsForVol(volName);
    await migrateLegacyUserRecordsForLoadedWords();
  }
}

async function ensureAllVolumesLoaded() {
  const results = await Promise.allSettled(volOrder.map((vol) => ensureVolLoaded(vol)));
  const failures = results.filter((result) => result.status === "rejected");

  if (failures.length === results.length) {
    throw failures[0].reason;
  }

  if (failures.length > 0) {
    console.warn("Some volumes failed to load", failures.map((failure) => failure.reason));
  }
}

async function loadSheet(volName) {
  const isChangingVol = currentMode !== "vol" || currentVol !== volName;
  if (isChangingVol && isAutoPlayActive()) {
    stopAutoPlay();
  }

  try {
    currentMode = "vol";
    currentVol = volName;
    navClearNavigationHistory();
    wordOrderUpdatePending = false;
    saveCurrentVol(currentVol);
    saveCurrentModeState(currentMode);
    // 指定ボリュームを先に読み込み、words を確実に設定する
    await ensureVolLoaded(volName);
    clearWordOrderCache();
    applyWordOrder();
    index = clampIndex(indexByVol[volName] || 0, words);

    requestListRebuild();
    render();
    finishInitialLoading();
    scheduleSpeechSyncAfterRender();
    scheduleAutoPlayAfterRender();

    preloadOtherVolumesInBackground();
  } catch (error) {
    console.error(error);
    finishInitialLoading();
    alert("読み込みに失敗しました。スプレッドシートの共有設定をご確認ください。");
  }
}

async function preloadOtherVolumesInBackground() {
  const otherVols = volOrder.filter((vol) => vol !== currentVol);
  await Promise.all(otherVols.map((vol) => ensureVolLoaded(vol).catch(() => {})));
}

function setReloadWordsStatus(message, options) {
  reloadWordsStatus.set(message, options);
}

function setReloadWordsInProgress(isLoading) {
  isReloadingWords = isLoading;
  if (!reloadWordsBtnEl) return;
  reloadWordsBtnEl.disabled = isLoading;
  reloadWordsBtnEl.textContent = isLoading ? "再読み込み中..." : "単語更新";
}

function hasAnyWordsByVol(wordsByVol) {
  return volOrder.some((vol) => (wordsByVol[vol] || []).length > 0);
}

function resetMultipleChoiceState() {
  multipleChoiceQuestion = null;
  multipleChoiceAnswer = null;
  multipleChoiceRevealedOptionIndexes.clear();
}

async function handleReloadWords() {
  if (isReloadingWords) return;

  const preserveWordId = getCurrentWord()?.id || null;
  const previousIndex = index;

  if (isAutoPlayActive()) {
    stopAutoPlay();
  }

  setReloadWordsInProgress(true);
  setReloadWordsStatus("単語データを再読み込みしています...");

  try {
    const refreshedWordsByVol = await fetchWordsByVol({ forceRefresh: true });
    if (!hasAnyWordsByVol(refreshedWordsByVol)) {
      throw new Error("No words parsed from refreshed CSV");
    }
    if (currentMode === "vol" && !(refreshedWordsByVol[currentVol] || []).length) {
      throw new Error(`No words parsed from refreshed CSV for ${currentVol}`);
    }

    allWordsByVol = { ...createInitialWordsByVol(), ...refreshedWordsByVol };
    await migrateLegacyUserRecordsForLoadedWords();
    clearWordOrderCache();
    resetMultipleChoiceState();
    applyWordOrder(false);
    index = getReloadedIndex({ words, previousIndex, preserveWordId });
    persistCurrentIndex();
    requestListRebuild();
    resetSwipeElementState(wordSlideCardEl);
    render();
    scheduleSpeechSyncAfterRender();
    setReloadWordsStatus("単語データを更新しました", { clearAfterMs: 4000 });
  } catch (error) {
    console.error("単語データの再読み込みに失敗しました:", error);
    setReloadWordsStatus("単語データの再読み込みに失敗しました");
  } finally {
    setReloadWordsInProgress(false);
  }
}

function applyWordOrder(resetIndex = false, preserveCurrentId = null) {
  const baseWords = currentMode === "favorites"
    ? buildFavoriteEntries(allWordsByVol, volOrder, favorites)
    : currentMode === "difficults"
      ? buildDifficultEntries(allWordsByVol, volOrder, difficults)
      : [...(allWordsByVol[currentVol] || [])];

  const orderMode = getWordOrderMode({ randomMode, frequencyMode });
  const cacheKey = orderMode ? makeWordOrderCacheKey({ orderMode, currentMode, currentVol }) : "";
  words = getOrderedWords({
    baseWords,
    orderMode,
    cache: wordOrderCache,
    cacheKey,
    getWeight: (item) => getReviewWeight(reviewScores, item, { starred: isFavorite(favorites, item) })
  });

  if (preserveCurrentId) {
    const preservedIndex = words.findIndex((item) => item && item.id === preserveCurrentId);
    index = preservedIndex >= 0 ? preservedIndex : clampIndex(index, words);
  } else {
    index = resetIndex ? 0 : clampIndex(index, words);
  }
}

function clearWordOrderCache() {
  wordOrderCache = {};
}

function requestListRebuild() {
  listNeedsRebuild = true;
  listVersion += 1;
}

function setListNeedsRebuild(value) {
  listNeedsRebuild = value;
}

function setRenderedListVersion(value) {
  renderedListVersion = value;
}

function setSearchQuery(value) {
  searchQuery = value.trim();
  if (searchInputEl && searchInputEl.value !== value) {
    searchInputEl.value = value;
  }
}

function persistCurrentIndex() {
  if (currentMode === "favorites") {
    indexByVol.favorites = index;
  } else if (currentMode === "difficults") {
    indexByVol.difficults = index;
  } else {
    indexByVol[currentVol] = index;
  }
  saveIndexByVol(indexByVol);
}

function setMeaningRevealTimer(timer) {
  meaningRevealTimer = timer;
}

function render() {
  renderApp(uiContext);
}

function renderCurrentWord() {
  renderCurrentWordUI(uiContext);
}

function renderLayout() {
  renderApp(uiContext, { skipCurrentWord: true });
}

function updateSpeechSyncButton() {
  uiUpdateSpeechSyncButton(uiContext);
}

function updateRecallTimeControl() {
  uiUpdateRecallTimeControl(uiContext);
}

function updateChallengeButton() {
  uiUpdateChallengeButton(uiContext);
  updateRecallTimeControl();
}

function updateTranslationButton() {
  uiUpdateTranslationButton(uiContext);
}

function updateMultipleChoiceButton() {
  uiUpdateMultipleChoiceButton(uiContext);
}

function updateAutoPlayButton() {
  uiUpdateAutoPlayButton(uiContext);
  updateRecallTimeControl();
}

function updateRandomButton() {
  uiUpdateRandomButton(uiContext);
}

function updateFrequencyButton() {
  uiUpdateFrequencyButton(uiContext);
}

function updateFavoriteToggleButton() {
  uiUpdateFavoriteToggleButton(uiContext);
}

function updateDifficultToggleButton() {
  uiUpdateDifficultToggleButton(uiContext);
}

function applySidebarState() {
  uiApplySidebarState(uiContext);
}

function clearMeaningRevealTimer() {
  if (meaningRevealTimer) {
    clearTimeout(meaningRevealTimer);
    meaningRevealTimer = null;
  }
}

function clearSpeechSyncTimer() {
  speechSyncController.clearTimer();
}

function speakCurrentWordForSpeechSync() {
  speechSyncController.speakNow();
}

function isAutoPlayActive() {
  return autoPlayController.isActive();
}

function stopAutoPlay() {
  autoPlayController.stop();
}

function shouldStopAutoPlayOnce(nextIndex) {
  return autoPlayController.shouldStopOnce(nextIndex);
}

function getCurrentAnswerText() {
  const current = getCurrentWord();
  if (!current) return "";
  return translationMode ? current.word : current.meaning;
}

function isAutoPlaySkipIgnoredTarget(target) {
  return target instanceof Element && Boolean(target.closest("button, input, textarea, select, a, .word-item"));
}

function revealCurrentMeaningImmediately() {
  if (!meaningEl || meaningEl.textContent !== "\u30fb\u30fb\u30fb") return false;
  clearMeaningRevealTimer();
  meaningEl.textContent = getCurrentAnswerText();
  return true;
}

function handleAutoPlaySkipRequest(event) {
  autoPlayController.handleSkipRequest(event);
}

function scheduleAutoPlay() {
  autoPlayController.schedule();
}

function scheduleAutoPlayAfterRender() {
  autoPlayController.scheduleAfterRender();
}
function scheduleSpeechSync() {
  speechSyncController.schedule();
}

function scheduleSpeechSyncAfterRender() {
  speechSyncController.scheduleAfterRender();
}

function getCurrentWord() {
  return words[index] || null;
}

function handleSpeakCurrentWord() {
  speakWord();
  scheduleAutoPlay();
}
function focusSearch() {
  if (!searchInputEl) return;
  if (!sidebarOpen) {
    sidebarOpen = true;
    saveSidebarState(sidebarOpen);
    applySidebarState();
  }
  searchInputEl.focus();
  searchInputEl.select();
}

function clearSearch() {
  if (!searchInputEl || searchInputEl.value === "") return false;
  setSearchQuery("");
  requestListRebuild();
  renderLayout();
  return true;
}

function getSearchResultItems() {
  return Array.from(listEl?.querySelectorAll(".word-item:not(.empty-result)") || [])
    .filter((item) => item instanceof HTMLElement);
}

function moveToSearchResult(direction) {
  const resultItems = getSearchResultItems();
  if (!resultItems.length) return;

  const resultIndexes = resultItems
    .map(readWordItemIndex)
    .filter((itemIndex) => itemIndex !== null);
  const nextIndex = getNextSearchResultIndex({ resultIndexes, currentIndex: index, direction });
  if (nextIndex === null) return;

  navMoveToIndex(nextIndex, { pushHistory: true });
  scheduleAutoPlayAfterRender();
}

function selectNextSearchResult() {
  moveToSearchResult(1);
}

function selectPreviousSearchResult() {
  moveToSearchResult(-1);
}
function closeSidebar() {
  if (!sidebarOpen) return;
  sidebarOpen = false;
  saveSidebarState(sidebarOpen);
  applySidebarState();
}
function toggleSidebar() {
  sidebarOpen = !sidebarOpen;
  saveSidebarState(sidebarOpen);
  applySidebarState();
}

function toggleSpeechSync() {
  speechSyncController.toggle();
}

function refreshCurrentWordAfterSettingChange() {
  if (isAutoPlayActive()) return;
  renderCurrentWord();
  scheduleSpeechSyncAfterRender();
}

function applyPendingWordOrderAsNext() {
  if (!wordOrderUpdatePending) return false;

  wordOrderUpdatePending = false;
  applyWordOrder(true);
  requestListRebuild();
  render();
  scheduleSpeechSyncAfterRender();
  scheduleAutoPlayAfterRender();
  persistCurrentIndex();
  return true;
}
function toggleChallengeMode() {
  challengeMode = !challengeMode;
  saveChallengeModeState(challengeMode);
  updateChallengeButton();
  refreshCurrentWordAfterSettingChange();
}

function toggleTranslationMode() {
  translationMode = !translationMode;
  multipleChoiceQuestion = null;
  multipleChoiceAnswer = null;
  multipleChoiceRevealedOptionIndexes.clear();
  saveTranslationModeState(translationMode);
  updateTranslationButton();
  refreshCurrentWordAfterSettingChange();
}

function toggleMultipleChoiceMode() {
  multipleChoiceMode = !multipleChoiceMode;
  multipleChoiceQuestion = null;
  multipleChoiceAnswer = null;
  multipleChoiceRevealedOptionIndexes.clear();
  saveMultipleChoiceModeState(multipleChoiceMode);
  updateMultipleChoiceButton();

  if (multipleChoiceMode && isAutoPlayActive()) {
    stopAutoPlay();
  }

  renderCurrentWord();
}

function toggleAutoPlay() {
  autoPlayController.toggle();
}

function toggleRandomMode() {
  randomMode = !randomMode;
  saveRandomModeState(randomMode);
  updateRandomButton();
  navClearNavigationHistory();
  clearWordOrderCache();

  if (isAutoPlayActive()) {
    wordOrderUpdatePending = true;
    return;
  }

  wordOrderUpdatePending = false;
  applyWordOrder(true);
  requestListRebuild();
  render();
  scheduleSpeechSyncAfterRender();
}

function toggleFrequencyMode() {
  frequencyMode = !frequencyMode;
  saveFrequencyModeState(frequencyMode);
  updateFrequencyButton();
  navClearNavigationHistory();
  clearWordOrderCache();

  if (isAutoPlayActive()) {
    wordOrderUpdatePending = true;
    return;
  }

  wordOrderUpdatePending = false;
  applyWordOrder(true);
  requestListRebuild();
  render();
  scheduleSpeechSyncAfterRender();
}

function prevWord() {
  if (!words.length) return;
  if (applyPendingWordOrderAsNext()) return;

  if (randomMode) {
    const historyIndex = navGetRandomPrevIndexFromHistory();
    if (historyIndex !== null) {
      index = historyIndex;
      renderCurrentWord();
      scheduleSpeechSync();
      scheduleAutoPlay();
      persistCurrentIndex();
      return;
    }
  }

  const prevIndex = (index - 1 + words.length) % words.length;
  navMoveToIndex(prevIndex, { pushHistory: randomMode });
  scheduleAutoPlayAfterRender();
}

function nextWord() {
  if (!words.length) return;
  if (applyPendingWordOrderAsNext()) return;

  if (randomMode) {
    const historyIndex = navGetRandomNextIndexFromHistory();
    if (historyIndex !== null) {
      index = historyIndex;
      renderCurrentWord();
      scheduleSpeechSync();
      scheduleAutoPlay();
      persistCurrentIndex();
      return;
    }
  }

  const nextIndex = (index + 1) % words.length;
  if (shouldStopAutoPlayOnce(nextIndex)) {
    stopAutoPlay();
    return;
  }
  if (shouldRebuildOrderAtCycleEnd({ nextIndex, randomMode, frequencyMode })) {
    navClearNavigationHistory();
    clearWordOrderCache();
    wordOrderUpdatePending = false;
    applyWordOrder(true);
    requestListRebuild();
    render();
    scheduleSpeechSyncAfterRender();
    scheduleAutoPlayAfterRender();
    return;
  }
  navMoveToIndex(nextIndex, { pushHistory: randomMode });
  scheduleAutoPlayAfterRender();
}

export { init, finishInitialLoading };


