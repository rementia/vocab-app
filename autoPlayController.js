const AUTO_PLAY_SKIP_LOCK_MS = 500;

export function createAutoPlayController({
  getState,
  saveAutoPlayState,
  updateAutoPlayButton,
  nextWord,
  speakCurrentWordForSpeechSync,
  revealCurrentMeaningImmediately,
  isSkipIgnoredTarget,
  requestFrame = requestAnimationFrame
}) {
  let autoPlayMode = "off";
  let autoPlayOnceStartPoint = null;
  let autoPlayTimer = null;
  let autoPlayDisplayPhaseTimer = null;
  let autoPlayWaitStartedAt = 0;

  function clearTimers() {
    if (autoPlayTimer) {
      clearTimeout(autoPlayTimer);
      autoPlayTimer = null;
    }

    if (autoPlayDisplayPhaseTimer) {
      clearTimeout(autoPlayDisplayPhaseTimer);
      autoPlayDisplayPhaseTimer = null;
    }
  }

  function isActive() {
    return autoPlayMode !== "off";
  }

  function getPoint(targetIndex = getState().index) {
    const state = getState();
    return {
      mode: state.currentMode,
      vol: state.currentMode === "vol" ? state.currentVol : null,
      index: targetIndex
    };
  }

  function isSamePoint(a, b) {
    return Boolean(a && b && a.mode === b.mode && a.vol === b.vol && a.index === b.index);
  }

  function shouldStopOnce(nextIndex) {
    return autoPlayMode === "once" && isSamePoint(autoPlayOnceStartPoint, getPoint(nextIndex));
  }

  function stop() {
    autoPlayMode = "off";
    autoPlayOnceStartPoint = null;
    saveAutoPlayState(autoPlayMode);
    updateAutoPlayButton();
    clearTimers();
  }

  function getDelay() {
    const state = getState();
    return state.challengeMode ? state.challengeTime + state.displayTime : state.displayTime;
  }

  function scheduleToNext(delay) {
    clearTimers();
    autoPlayWaitStartedAt = Date.now();
    autoPlayTimer = setTimeout(() => {
      nextWord();
    }, delay);
  }

  function isSkipLocked() {
    return Date.now() - autoPlayWaitStartedAt < AUTO_PLAY_SKIP_LOCK_MS;
  }

  function handleSkipRequest(event) {
    const state = getState();
    if (!isActive() || !state.words.length) return;
    if (isSkipIgnoredTarget(event.target)) return;
    if (isSkipLocked()) return;

    if (state.challengeMode && revealCurrentMeaningImmediately()) {
      scheduleToNext(state.displayTime);
      return;
    }

    nextWord();
  }

  function schedule() {
    const state = getState();
    if (!isActive() || !state.words.length) return;
    clearTimers();
    autoPlayWaitStartedAt = Date.now();

    if (state.challengeMode) {
      autoPlayDisplayPhaseTimer = setTimeout(() => {
        autoPlayWaitStartedAt = Date.now();
        autoPlayDisplayPhaseTimer = null;
      }, state.challengeTime);
    }

    autoPlayTimer = setTimeout(() => {
      nextWord();
    }, getDelay());
  }

  function scheduleAfterRender() {
    if (!isActive()) return;
    requestFrame(() => {
      requestFrame(() => {
        schedule();
      });
    });
  }

  function toggle() {
    autoPlayMode = autoPlayMode === "off" ? "once" : "off";
    autoPlayOnceStartPoint = autoPlayMode === "once" ? getPoint() : null;
    saveAutoPlayState(autoPlayMode);
    updateAutoPlayButton();

    if (!isActive()) {
      clearTimers();
    } else {
      speakCurrentWordForSpeechSync();
      schedule();
    }
  }

  return {
    clearTimers,
    getMode: () => autoPlayMode,
    setMode: (mode) => {
      autoPlayMode = mode === "once" ? "once" : "off";
      autoPlayOnceStartPoint = autoPlayMode === "once" ? getPoint() : null;
    },
    getPoint,
    handleSkipRequest,
    isActive,
    schedule,
    scheduleAfterRender,
    shouldStopOnce,
    stop,
    toggle
  };
}
