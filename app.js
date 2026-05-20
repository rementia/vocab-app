import { initializeApp } from "https://www.gstatic.com/firebasejs/12.12.0/firebase-app.js";
import {
  getAuth,
  GoogleAuthProvider,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.12.0/firebase-auth.js";
import {
  getFirestore
} from "https://www.gstatic.com/firebasejs/12.12.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyCgVh9fmwib7ox-I1Q9c5IU-B4909XkhkU",
  authDomain: "svl-app-65204.firebaseapp.com",
  projectId: "svl-app-65204",
  storageBucket: "svl-app-65204.firebasestorage.app",
  messagingSenderId: "512772798709",
  appId: "1:512772798709:web:d28cb5154b15fccae26dbc",
  measurementId: "G-XYZMESKJRM"
};
import { sheetUrls, fetchWordsForVol } from './data.js';
import { signInWithGoogle, signOutUser } from './auth.js';

import {
  STORAGE_KEYS,
  safeGetItem,
  saveCurrentVol,
  saveCurrentModeState,
  saveIndexByVol,
  saveSidebarState,
  saveAutoSpeakState,
  saveFavoritesToLocalOnly,
  saveFavoritesUpdatedAt,
  saveChallengeModeState,
  saveChallengeTimeState,
  saveRandomModeState
} from './storage.js';

import {
  renderApp,
  renderCurrentWord as renderCurrentWordUI,
  updateAutoSpeakButton as uiUpdateAutoSpeakButton,
  updateChallengeButton as uiUpdateChallengeButton,
  updateRandomButton as uiUpdateRandomButton,
  updateFavoriteToggleButton as uiUpdateFavoriteToggleButton,
  applySidebarState as uiApplySidebarState,
  updateAuthUI as uiUpdateAuthUI
} from './ui.js';
import {
  buildFavoriteEntries,
  isFavorite,
  toggleFavoriteCurrentWord as toggleFavoriteCurrentWordManager,
  loadFavoritesMode as loadFavoritesModeManager
} from './favoritesManager.js';
import {
  bindKeyboardEvents,
  bindTouchEvents,
  isSwipeAllowedTarget,
  handleViewportChange
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
  loadPronunciation
} from './pronunciation.js';

const volOrder = ["vol1", "vol2", "vol3", "vol4"];
const FAVORITES_COLLECTION = "portfolioUsers";
const firebaseApp = initializeApp(firebaseConfig);

import {
  loadFavoritesFromCloudRemote,
  subscribeFavoritesRealtimeRemote,
  saveFavoritesToCloudRemote,
  syncFavoritesWithCloud,
  resolveFavoritesSnapshot
} from './favorites.js';
const auth = getAuth(firebaseApp);
const db = getFirestore(firebaseApp);
const provider = new GoogleAuthProvider();

provider.setCustomParameters({
  prompt: "select_account"
});

const listEl = document.getElementById("list");
const sidebarEl = document.getElementById("sidebar");
const wordEl = document.getElementById("word");
const meaningEl = document.getElementById("meaning");
const progressEl = document.getElementById("progress");
const pronunciationEl = document.getElementById("pronunciation");
const prevHintEl = document.getElementById("prevHint");
const nextHintEl = document.getElementById("nextHint");
const currentEl = document.getElementById("current");
const timeSlider = document.getElementById("timeSlider");
const timeValue = document.getElementById("timeValue");

const favoriteToggleBtnEl = document.getElementById("favoriteToggleBtn");
const favoriteListBtnEl = document.getElementById("favoriteListBtn");
const autoSpeakBtnEl = document.getElementById("autoSpeakBtn");
const challengeBtnEl = document.getElementById("challengeBtn");
const randomBtnEl = document.getElementById("randomBtn");
const loginBtnEl = document.getElementById("loginBtn");
const logoutBtnEl = document.getElementById("logoutBtn");
const toggleSidebarBtnEl = document.getElementById("toggleSidebarBtn");
const prevWordBtnEl = document.getElementById("prevWordBtn");
const nextWordBtnEl = document.getElementById("nextWordBtn");
const speakWordBtnEl = document.getElementById("speakWordBtn");
const volButtons = Array.from(document.querySelectorAll(".vol-btn"));

let currentUser = null;
let favoritesUnsubscribe = null;

let allWordsByVol = {
  vol1: [],
  vol2: [],
  vol3: [],
  vol4: []
};

let words = [];
let index = 0;
let currentVol = "vol1";
let currentMode = "vol";
let sidebarOpen = true;
let autoSpeak = false;
let favorites = {};
let favoritesUpdatedAt = 0;
let challengeMode = false;
let challengeTime = 1500;
let randomMode = false;

let meaningRevealTimer = null;
let autoSpeakTimer = null;
let hasFinishedInitialLoading = false;

let listNeedsRebuild = true;
let renderedListVersion = "";
let listVersion = 0;
let favoritesVersion = 0;

let indexByVol = {
  vol1: 0,
  vol2: 0,
  vol3: 0,
  vol4: 0,
  favorites: 0
};

const uiContext = {
  getState: () => ({
    words,
    currentMode,
    currentVol,
    randomMode,
    listNeedsRebuild,
    renderedListVersion,
    listVersion,
    favoritesVersion,
    index,
    challengeMode,
    challengeTime,
    historyBackStack: getHistoryBackStack(),
    historyForwardStack: getHistoryForwardStack(),
    sidebarOpen,
    autoSpeak,
    currentUser
  }),
  dom: {
    listEl,
    sidebarEl,
    wordEl,
    meaningEl,
    progressEl,
    pronunciationEl,
    prevHintEl,
    nextHintEl,
    currentEl,
    favoriteToggleBtnEl,
    favoriteListBtnEl,
    autoSpeakBtnEl,
    challengeBtnEl,
    randomBtnEl,
    loginBtnEl,
    logoutBtnEl,
    toggleSidebarBtnEl,
    volButtons
  },
  callbacks: {
    isFavorite: (item) => isFavorite(favorites, item),
    getCurrentWord,
    persistCurrentIndex,
    loadPronunciation,
    clearMeaningRevealTimer,
    clearAutoSpeakTimer,
    setMeaningRevealTimer,
    setListNeedsRebuild,
    setRenderedListVersion
  }
};

let shuffledWordsMap = {};

/**
 * ランダム中の「戻る」を履歴ベースにするための履歴
 */
// navigation history moved to navigation.js

async function init() {
  loadSavedState();
  initNavigation({
    getIndex: () => index,
    setIndex: (n) => { index = n; },
    renderCurrentWord,
    scheduleAutoSpeak,
    getWordsLength: () => words.length
  });
  bindTouchEvents({ prevWord, nextWord, isSwipeAllowedTarget });
  bindUIEvents();
  bindKeyboardEvents({
    prevWord,
    nextWord,
    speakWord,
    handleToggleFavoriteCurrentWord,
    toggleRandomMode
  });
  setupAuthListener();
  initPronunciation({ el: pronunciationEl, getCurrentWord });
  updateSpeechButtonAvailability(speakWordBtnEl);

  window.addEventListener("resize", handleViewportResize);
  window.addEventListener("orientationchange", handleViewportResize);

  if (window.visualViewport) {
    window.visualViewport.addEventListener("resize", handleViewportResize);
  }

  if (currentMode === "favorites") {
    await handleLoadFavoritesMode();
    saveSidebarState(sidebarOpen);
    finishInitialLoading();
  }
  else {
    // 初回通常モード時はシートを読み込んで初期表示を完了する
    await loadSheet(currentVol);
  }
}

const handleViewportResize = handleViewportChange(render);

async function handleLoadFavoritesMode() {
  const result = await loadFavoritesModeManager(
    { allWordsByVol, currentMode, currentVol, indexByVol, favorites, words, randomMode },
    {
      ensureAllVolumesLoaded,
      saveCurrentModeState,
      saveRandomModeState,
      clearNavigationHistory: navClearNavigationHistory,
      applyWordOrder,
      requestListRebuild,
      render,
      updateRandomButton,
      getWords: () => words,
      getCurrentWord,
      setCurrentMode: (mode) => { currentMode = mode; },
      setRandomMode: (value) => { randomMode = value; }
    },
    volOrder
  );

  if (result) {
    currentMode = result.currentMode;
    index = result.index;
    if (typeof result.randomMode === "boolean") {
      randomMode = result.randomMode;
    }
  }
}

function handleToggleFavoriteCurrentWord() {
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
      clearAllShuffleCache,
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
  }
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
  loginBtnEl?.addEventListener("click", () => signInWithGoogle(auth, provider));
  logoutBtnEl?.addEventListener("click", () => signOutUser(auth));
  toggleSidebarBtnEl?.addEventListener("click", toggleSidebar);
  autoSpeakBtnEl?.addEventListener("click", toggleAutoSpeak);
  challengeBtnEl?.addEventListener("click", toggleChallengeMode);
  randomBtnEl?.addEventListener("click", toggleRandomMode);
  favoriteListBtnEl?.addEventListener("click", handleLoadFavoritesMode);
  favoriteToggleBtnEl?.addEventListener("click", handleToggleFavoriteCurrentWord);
  prevWordBtnEl?.addEventListener("click", prevWord);
  nextWordBtnEl?.addEventListener("click", nextWord);
  speakWordBtnEl?.addEventListener("click", speakWord);

  if (timeSlider && timeValue) {

      timeSlider.value = challengeTime / 1000;
      timeValue.textContent = (challengeTime / 1000).toFixed(1);

      timeSlider.addEventListener("input", () => {

        challengeTime = parseFloat(timeSlider.value) * 1000;

        timeValue.textContent = parseFloat(timeSlider.value).toFixed(1);

        saveChallengeTimeState(challengeTime);

        if (challengeMode) {
          renderCurrentWord();
        }

      });
    }

  volButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const volName = button.dataset.vol;
      if (volName) {
        loadSheet(volName);
      }
    });
  });

  listEl?.addEventListener("click", (event) => {
    const target = event.target instanceof Element ? event.target.closest(".word-item") : null;
    if (!(target instanceof HTMLElement)) return;

    const nextIndex = Number(target.dataset.index);
    if (Number.isNaN(nextIndex)) return;

    navMoveToIndex(nextIndex, { pushHistory: true });
  });
}


function loadSavedState() {
  const savedVol = safeGetItem(STORAGE_KEYS.vol);
  const savedSidebarOpen = safeGetItem(STORAGE_KEYS.sidebarOpen);
  const savedAutoSpeak = safeGetItem(STORAGE_KEYS.autoSpeak);
  const savedIndexByVol = safeGetItem(STORAGE_KEYS.indexByVol);
  const savedFavorites = safeGetItem(STORAGE_KEYS.favorites);
  const savedFavoritesUpdatedAt = safeGetItem(STORAGE_KEYS.favoritesUpdatedAt);
  const savedChallengeMode = safeGetItem(STORAGE_KEYS.challengeMode);
  const savedChallengeTime = safeGetItem(STORAGE_KEYS.challengeTime);
  const savedRandomMode = safeGetItem(STORAGE_KEYS.randomMode);
  const savedMode = safeGetItem(STORAGE_KEYS.mode);

  if (savedVol && sheetUrls[savedVol]) currentVol = savedVol;
  if (savedSidebarOpen !== null) sidebarOpen = savedSidebarOpen === "true";
  if (savedAutoSpeak !== null) autoSpeak = savedAutoSpeak === "true";

  if (savedIndexByVol) {
    try {
      indexByVol = { ...indexByVol, ...JSON.parse(savedIndexByVol) };
    } catch (error) {
      console.warn("indexByVol restore failed", error);
    }
  }

  if (savedMode === "favorites") {
    currentMode = "favorites";
  }

  if (savedFavorites) {
    try {
      const parsedFavorites = JSON.parse(savedFavorites);
      favorites = parsedFavorites && typeof parsedFavorites === "object" ? parsedFavorites : {};
    } catch {
      favorites = {};
    }
  }

  if (savedFavoritesUpdatedAt) {
    favoritesUpdatedAt = Number(savedFavoritesUpdatedAt) || 0;
  }

  if (savedChallengeMode !== null) challengeMode = savedChallengeMode === "true";

  if (savedChallengeTime !== null) {
    const parsedTime = Number(savedChallengeTime);
    if (!Number.isNaN(parsedTime)) {
      challengeTime = parsedTime;
    }
  }

  if (savedRandomMode !== null) randomMode = savedRandomMode === "true";

  updateAutoSpeakButton();
  updateChallengeButton();
  updateRandomButton();
  applySidebarState();
}

function setupAuthListener() {
  onAuthStateChanged(auth, async (user) => {
    currentUser = user;
    uiUpdateAuthUI(uiContext);

    if (favoritesUnsubscribe) {
      favoritesUnsubscribe();
      favoritesUnsubscribe = null;
    }

    if (!user) return;

    await loadFavoritesFromCloud();
    subscribeFavoritesRealtime();
    requestListRebuild();
    render();
  });
}

function subscribeFavoritesRealtime() {
  if (!currentUser) return;

  favoritesUnsubscribe = subscribeFavoritesRealtimeRemote(db, FAVORITES_COLLECTION, currentUser.uid, (snap) => {
    const result = resolveFavoritesSnapshot(snap, favoritesUpdatedAt);
    if (!result) return;

    favorites = result.favorites;
    favoritesUpdatedAt = result.favoritesUpdatedAt;
    favoritesVersion += 1;

    saveFavoritesToLocalOnly(favorites);
    saveFavoritesUpdatedAt(favoritesUpdatedAt);
    clearAllShuffleCache();
    requestListRebuild();

    if (currentMode === "favorites") {
      applyWordOrder(false);
      index = Math.min(index, Math.max(words.length - 1, 0));
    }

    render();
  });
}

// Storage helpers moved to storage.js

async function loadFavoritesFromCloud() {
  if (!currentUser) return;

  try {
    const result = await syncFavoritesWithCloud(
      db,
      FAVORITES_COLLECTION,
      currentUser.uid,
      favorites,
      favoritesUpdatedAt
    );

    favorites = result.favorites;
    favoritesUpdatedAt = result.favoritesUpdatedAt;
    favoritesVersion += 1;
    saveFavoritesToLocalOnly(favorites);
    saveFavoritesUpdatedAt(favoritesUpdatedAt);
  } catch (error) {
    console.error("クラウド読み込み失敗:", error);
  }
}

async function saveFavoritesToCloud() {
  if (!currentUser) return;

  try {
    await saveFavoritesToCloudRemote(db, FAVORITES_COLLECTION, currentUser.uid, favorites, favoritesUpdatedAt);
  } catch (error) {
    console.error("クラウド保存失敗:", error);
  }
}

async function ensureVolLoaded(volName) {
  if (!allWordsByVol[volName] || allWordsByVol[volName].length === 0) {
    allWordsByVol[volName] = await fetchWordsForVol(volName);
  }
}

async function ensureAllVolumesLoaded() {
  await Promise.all(volOrder.map((vol) => ensureVolLoaded(vol)));
}

async function loadSheet(volName) {
  try {
    currentMode = "vol";
    currentVol = volName;
    navClearNavigationHistory();
    saveCurrentVol(currentVol);
    saveCurrentModeState(currentMode);
    // 指定ボリュームを先に読み込み、words を確実に設定する
    await ensureVolLoaded(volName);
    applyWordOrder();
    index = Math.min(indexByVol[volName] || 0, Math.max(words.length - 1, 0));

    requestListRebuild();
    render();
    finishInitialLoading();

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

function makeShuffleKey() {
  return currentMode === "favorites" ? "favorites:all" : `vol:${currentVol}`;
}

function shuffleArray(array) {
  const copied = [...array];
  for (let i = copied.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copied[i], copied[j]] = [copied[j], copied[i]];
  }
  return copied;
}

function applyWordOrder(resetIndex = false, preserveCurrentId = null) {
  const baseWords = currentMode === "favorites"
    ? buildFavoriteEntries(allWordsByVol, volOrder, favorites)
    : [...(allWordsByVol[currentVol] || [])];

  if (randomMode) {
    const shuffleKey = makeShuffleKey();
    const currentCache = shuffledWordsMap[shuffleKey];

    const cacheValid =
      Array.isArray(currentCache) &&
      currentCache.length === baseWords.length &&
      currentCache.every((item) => baseWords.some((base) => base.id === item.id));

    if (!cacheValid) {
      shuffledWordsMap[shuffleKey] = shuffleArray(baseWords);
    }

    words = shuffledWordsMap[shuffleKey];
  } else {
    words = baseWords;
  }

  if (preserveCurrentId) {
    const preservedIndex = words.findIndex((item) => item && item.id === preserveCurrentId);
    index = preservedIndex >= 0 ? preservedIndex : Math.min(index, Math.max(words.length - 1, 0));
  } else {
    index = resetIndex ? 0 : Math.min(index, Math.max(words.length - 1, 0));
  }
}

function clearAllShuffleCache() {
  shuffledWordsMap = {};
}

// navigation functions moved to navigation.js

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

function persistCurrentIndex() {
  if (currentMode === "favorites") {
    indexByVol.favorites = index;
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

function updateAutoSpeakButton() {
  uiUpdateAutoSpeakButton(uiContext);
}

function updateChallengeButton() {
  uiUpdateChallengeButton(uiContext);
}

function updateRandomButton() {
  uiUpdateRandomButton(uiContext);
}

function updateFavoriteToggleButton() {
  uiUpdateFavoriteToggleButton(uiContext);
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

function clearAutoSpeakTimer() {
  if (autoSpeakTimer) {
    clearTimeout(autoSpeakTimer);
    autoSpeakTimer = null;
  }
}

function scheduleAutoSpeak() {
  if (!autoSpeak) return;
  autoSpeakTimer = setTimeout(() => {
    speakWord();
  }, 260);
}

function getCurrentWord() {
  return words[index] || null;
}

function toggleSidebar() {
  sidebarOpen = !sidebarOpen;
  saveSidebarState(sidebarOpen);
  applySidebarState();
}

function toggleAutoSpeak() {
  autoSpeak = !autoSpeak;
  saveAutoSpeakState(autoSpeak);
  updateAutoSpeakButton();

  if (!autoSpeak) {
    clearAutoSpeakTimer();
  } else {
    scheduleAutoSpeak();
  }
}

function toggleChallengeMode() {
  challengeMode = !challengeMode;
  saveChallengeModeState(challengeMode);
  updateChallengeButton();
  renderCurrentWord();
}

function toggleRandomMode() {
  const currentId = getCurrentWord()?.id || null;
  randomMode = !randomMode;
  saveRandomModeState(randomMode);
  updateRandomButton();
  navClearNavigationHistory();

  if (!randomMode) {
    clearAllShuffleCache();
  }

  applyWordOrder(false, currentId);
  requestListRebuild();
  render();
}

function prevWord() {
  if (!words.length) return;

  if (randomMode) {
    const historyIndex = navGetRandomPrevIndexFromHistory();
    if (historyIndex !== null) {
      index = historyIndex;
      renderCurrentWord();
      scheduleAutoSpeak();
      return;
    }
  }

  const prevIndex = (index - 1 + words.length) % words.length;
  navMoveToIndex(prevIndex, { pushHistory: randomMode });
}

function nextWord() {
  if (!words.length) return;

  if (randomMode) {
    const historyIndex = navGetRandomNextIndexFromHistory();
    if (historyIndex !== null) {
      index = historyIndex;
      renderCurrentWord();
      scheduleAutoSpeak();
      return;
    }
  }

  const nextIndex = (index + 1) % words.length;
  navMoveToIndex(nextIndex, { pushHistory: randomMode });
}

// pronunciation logic moved to pronunciation.js

export { init, finishInitialLoading };
