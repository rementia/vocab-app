export function bindKeyboardEvents({ prevWord, nextWord, speakWord, handleToggleFavoriteCurrentWord, toggleRandomMode }) {
  document.addEventListener("keydown", (event) => {
    const target = event.target;
    if (
      target instanceof HTMLInputElement ||
      target instanceof HTMLTextAreaElement ||
      target instanceof HTMLSelectElement
    ) {
      return;
    }

    if (event.key === "ArrowLeft") {
      event.preventDefault();
      prevWord();
      return;
    }

    if (event.key === "ArrowRight") {
      event.preventDefault();
      nextWord();
      return;
    }

    if (event.key === " " || event.code === "Space") {
      event.preventDefault();
      speakWord();
      return;
    }

    if (event.key.toLowerCase() === "f") {
      event.preventDefault();
      handleToggleFavoriteCurrentWord();
      return;
    }

    if (event.key.toLowerCase() === "r") {
      event.preventDefault();
      toggleRandomMode();
    }
  });
}

export function bindTouchEvents({ prevWord, nextWord, isSwipeAllowedTarget }) {
  let touchStartX = 0;
  let touchStartY = 0;
  let touchEndX = 0;
  let touchEndY = 0;
  let lastTouchEnd = 0;
  let touchStartTime = 0;
  let swipeEnabled = false;

  document.addEventListener(
    "touchstart",
    (event) => {
      touchStartTime = Date.now();
      const touch = event.changedTouches[0];
      if (!touch) return;

      const startTarget = event.target instanceof Element ? event.target : null;
      swipeEnabled = isSwipeAllowedTarget(startTarget);
      touchStartX = touch.screenX;
      touchStartY = touch.screenY;
    },
    { passive: true }
  );

  document.addEventListener(
    "touchend",
    (event) => {
      const touch = event.changedTouches[0];
      if (!touch) return;

      const touchDuration = Date.now() - touchStartTime;
      if (touchDuration >= 1000) {
        swipeEnabled = false;
        return;
      }

      touchEndX = touch.screenX;
      touchEndY = touch.screenY;

      if (swipeEnabled) {
        const diffX = touchEndX - touchStartX;
        const diffY = Math.abs(touchEndY - touchStartY);
        const thresholdX = 50;
        const thresholdY = 50;

        if (Math.abs(diffX) >= thresholdX && diffY <= thresholdY) {
          if (diffX > 0) {
            prevWord();
          } else {
            nextWord();
          }
        }
      }

      const now = Date.now();
      if (now - lastTouchEnd <= 300) {
        event.preventDefault();
      }
      lastTouchEnd = now;
      swipeEnabled = false;
    },
    { passive: false }
  );
}

export function isSwipeAllowedTarget(target) {
  if (!(target instanceof Element)) return true;
  if (target.closest("button, a, input, textarea, select, label")) return false;
  if (target.closest("#sidebar")) return false;
  return true;
}

function resetPageOffset() {
  window.scrollTo(0, 0);
  document.documentElement.scrollTop = 0;
  document.body.scrollTop = 0;
}

export function handleViewportChange(render) {
  let viewportResizeTimer = null;

  return () => {
    clearTimeout(viewportResizeTimer);
    resetPageOffset();
    requestAnimationFrame(resetPageOffset);
    viewportResizeTimer = setTimeout(() => {
      resetPageOffset();
      render();
    }, 180);
  };
}