function getState(context) {
  return context.getState();
}

function getDom(context) {
  return context.dom;
}

function getCallbacks(context) {
  return context.callbacks;
}

export function renderApp(context) {
  renderList(context);
  renderCurrentWord(context);
  updateCurrentLabel(context);
  updateTopButtons(context);
  updateRandomButton(context);
  applySidebarState(context);
}

export function renderList(context) {
  const state = getState(context);
  const dom = getDom(context);
  const callbacks = getCallbacks(context);

  if (!dom.listEl) return;

  const nextVersion = getListRenderVersion(state);
  if (!state.listNeedsRebuild && state.renderedListVersion === nextVersion) {
    highlightActiveWord(context);
    return;
  }

  dom.listEl.innerHTML = "";
  const fragment = document.createDocumentFragment();

  state.words.forEach((item, itemIndex) => {
    const row = document.createElement("div");
    row.className = "word-item";
    row.dataset.index = String(itemIndex);

    const label = document.createElement("span");
    label.className = "word-label";
    if (!item) {
      label.textContent = "";
      console.warn('renderList: missing item at index', itemIndex);
    } else {
      label.textContent = state.currentMode === "favorites"
        ? `${item.word} (${item.sourceVol.replace("vol", "vol.")})`
        : item.word;
    }
    row.appendChild(label);

    if (item && callbacks.isFavorite(item)) {
      const star = document.createElement("span");
      star.className = "item-star";
      star.textContent = "★";
      row.appendChild(star);
    }

    fragment.appendChild(row);
  });

  dom.listEl.appendChild(fragment);
  callbacks.setListNeedsRebuild(false);
  callbacks.setRenderedListVersion(nextVersion);
  highlightActiveWord(context);
}

function getListRenderVersion(state) {
  return `${state.currentMode}|${state.currentVol}|${state.randomMode ? 1 : 0}|${state.listVersion}|${state.favoritesVersion}`;
}

export function renderCurrentWord(context) {
  const state = getState(context);
  const dom = getDom(context);
  const callbacks = getCallbacks(context);

  callbacks.clearMeaningRevealTimer();
  callbacks.clearAutoSpeakTimer();

  const current = callbacks.getCurrentWord();
  if (!current) {
    if (dom.wordEl) {
      dom.wordEl.textContent = state.currentMode === "favorites"
        ? "お気に入りがありません"
        : "単語がありません";
    }
    if (dom.meaningEl) {
      dom.meaningEl.textContent = state.currentMode === "favorites"
        ? "☆を付けるとここに表示されます"
        : "";
    }
    if (dom.progressEl) dom.progressEl.textContent = "";
    if (dom.pronunciationEl) dom.pronunciationEl.textContent = "";
    if (dom.prevHintEl) dom.prevHintEl.textContent = "";
    if (dom.nextHintEl) dom.nextHintEl.textContent = "";
    updateFavoriteToggleButton(context);
    return;
  }

  renderWordText(context, current);
  updateMeaningDisplay(context, current.meaning);
  updateCurrentStateMeta(context);
  callbacks.loadPronunciation(current.word);
}

function renderWordText(context, current) {
  const dom = getDom(context);
  if (dom.wordEl) dom.wordEl.textContent = current.word;
}

function updateCurrentStateMeta(context) {
  const callbacks = getCallbacks(context);

  callbacks.persistCurrentIndex();
  const activeItem = highlightActiveWord(context);
  scrollActiveWordIntoView(context, activeItem);
  updateNavHints(context);
  updateFavoriteToggleButton(context);
  updateProgress(context);
}

export function updateCurrentLabel(context) {
  const state = getState(context);
  const dom = getDom(context);

  if (!dom.currentEl) return;

  let label = state.currentMode === "favorites"
    ? "☆"
    : `vol.${state.currentVol.replace("vol", "")}`;

  if (state.randomMode) {
    label += " / ランダム";
  }

  dom.currentEl.textContent = label;
}

export function updateTopButtons(context) {
  const state = getState(context);
  const dom = getDom(context);

  dom.volButtons.forEach((button) => {
    const isActive = state.currentMode === "vol" && button.dataset.vol === state.currentVol;
    button.classList.toggle("active-vol", isActive);
  });

  if (dom.favoriteListBtnEl) {
    dom.favoriteListBtnEl.classList.toggle("active-vol", state.currentMode === "favorites");
  }
}

export function updateToggleButton(context, button, label, isActive) {
  if (!button) return;
  button.textContent = label;
  button.classList.toggle("active", isActive);
  button.classList.toggle("active-blue", isActive);
  button.setAttribute("aria-pressed", isActive ? "true" : "false");
}

export function updateFavoriteToggleButton(context) {
  const state = getState(context);
  const dom = getDom(context);
  const callbacks = getCallbacks(context);
  const current = callbacks.getCurrentWord();
  if (!dom.favoriteToggleBtnEl) return;

  if (!current) {
    dom.favoriteToggleBtnEl.textContent = "☆";
    dom.favoriteToggleBtnEl.classList.remove("active");
    dom.favoriteToggleBtnEl.title = "お気に入り登録";
    dom.favoriteToggleBtnEl.setAttribute("aria-label", "お気に入り登録");
    dom.favoriteToggleBtnEl.setAttribute("aria-pressed", "false");
    dom.favoriteToggleBtnEl.disabled = true;
    return;
  }

  dom.favoriteToggleBtnEl.disabled = false;

  const active = callbacks.isFavorite(current);
  dom.favoriteToggleBtnEl.textContent = active ? "★" : "☆";
  dom.favoriteToggleBtnEl.classList.toggle("active", active);
  dom.favoriteToggleBtnEl.title = active ? "★解除" : "★登録";
  dom.favoriteToggleBtnEl.setAttribute("aria-label", active ? "お気に入り解除" : "お気に入り登録");
  dom.favoriteToggleBtnEl.setAttribute("aria-pressed", active ? "true" : "false");
}

export function updateNavHints(context) {
  const state = getState(context);
  const dom = getDom(context);

  if (!dom.prevHintEl || !dom.nextHintEl) return;
  if (!state.words.length) {
    dom.prevHintEl.textContent = "";
    dom.nextHintEl.textContent = "";
    return;
  }

  const prevIndex = state.randomMode && state.historyBackStack.length
    ? state.historyBackStack[state.historyBackStack.length - 1]
    : (state.index - 1 + state.words.length) % state.words.length;

  const nextIndex = state.randomMode && state.historyForwardStack.length
    ? state.historyForwardStack[state.historyForwardStack.length - 1]
    : (state.index + 1) % state.words.length;

  dom.prevHintEl.textContent = state.words[prevIndex]?.word || "";
  dom.nextHintEl.textContent = state.words[nextIndex]?.word || "";
}

export function updateProgress(context) {
  const state = getState(context);
  const dom = getDom(context);

  if (!dom.progressEl) return;

  if (state.randomMode) {
    dom.progressEl.textContent = "";
    return;
  }

  const total = state.words.length;
  const current = total === 0 ? 0 : state.index + 1;
  dom.progressEl.textContent = `${current} / ${total}`;
}

export function updateAutoSpeakButton(context) {
  updateToggleButton(context, getDom(context).autoSpeakBtnEl, "自動発音", getState(context).autoSpeak);
}

export function updateChallengeButton(context) {
  updateToggleButton(context, getDom(context).challengeBtnEl, "想起学習", getState(context).challengeMode);
}

export function updateRandomButton(context) {
  updateToggleButton(context, getDom(context).randomBtnEl, "ランダム", getState(context).randomMode);
}

export function updateAuthUI(context) {
  const dom = getDom(context);
  const state = getState(context);

  if (!dom.loginBtnEl || !dom.logoutBtnEl) return;

  dom.loginBtnEl.style.display = state.currentUser ? "none" : "inline-block";
  dom.logoutBtnEl.style.display = state.currentUser ? "inline-block" : "none";
}

export function updateMeaningDisplay(context, meaning) {
  const state = getState(context);
  const dom = getDom(context);
  const callbacks = getCallbacks(context);

  if (!dom.meaningEl) return;
  callbacks.clearMeaningRevealTimer();

  if (!state.challengeMode) {
    dom.meaningEl.textContent = meaning;
    return;
  }

  dom.meaningEl.textContent = "・・・";
  callbacks.setMeaningRevealTimer(setTimeout(() => {
    dom.meaningEl.textContent = meaning;
  }, state.challengeTime));
}

function highlightActiveWord(context) {
  const state = getState(context);
  const dom = getDom(context);

  const currentActive = dom.listEl?.querySelector(".word-item.active");
  const nextActive = dom.listEl?.querySelector(`.word-item[data-index="${state.index}"]`);

  if (currentActive && currentActive !== nextActive) {
    currentActive.classList.remove("active");
  }
  if (nextActive) {
    nextActive.classList.add("active");
  }
  return nextActive || null;
}

function scrollActiveWordIntoView(context, activeItem) {
  if (!activeItem) return;

  activeItem.scrollIntoView({
    block: "center",
    behavior: "auto"
  });
}

export function applySidebarState(context) {
  const state = getState(context);
  const dom = getDom(context);

  if (!dom.sidebarEl) return;
  dom.sidebarEl.classList.toggle("hidden", !state.sidebarOpen);
  dom.toggleSidebarBtnEl?.classList.toggle("active", state.sidebarOpen);
  dom.toggleSidebarBtnEl?.setAttribute("aria-expanded", String(state.sidebarOpen));
}

export function clearMeaningRevealTimer(context) {
  const callbacks = getCallbacks(context);
  callbacks.clearMeaningRevealTimer();
}
