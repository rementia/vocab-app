import assert from "assert";
import { renderCurrentWord, updateAuthUI, updateCurrentLabel, updateReviewButtons } from "../ui.js";

function makeContext(currentUser) {
  return {
    getState: () => ({ currentUser }),
    dom: {
      loginBtnEl: { hidden: true },
      logoutBtnEl: { hidden: false }
    },
    callbacks: {}
  };
}

let context = makeContext(null);
updateAuthUI(context);
assert.strictEqual(context.dom.loginBtnEl.hidden, false);
assert.strictEqual(context.dom.logoutBtnEl.hidden, true);

context = makeContext({ uid: "user-1" });
updateAuthUI(context);
assert.strictEqual(context.dom.loginBtnEl.hidden, true);
assert.strictEqual(context.dom.logoutBtnEl.hidden, false);

const labelContext = {
  dom: { currentEl: { textContent: "" } },
  getState: () => ({
    currentMode: "normal",
    currentVol: "vol4",
    frequencyMode: true,
    randomMode: true
  })
};
updateCurrentLabel(labelContext);
assert.strictEqual(labelContext.dom.currentEl.textContent, "vol.4");

function makeButton() {
  return {
    disabled: false,
    title: "",
    attributes: {},
    classList: { remove() {} },
    setAttribute(name, value) {
      this.attributes[name] = value;
    }
  };
}

const reviewWords = [{ id: "word-1" }, { id: "word-2" }];
let reviewIndex = 0;
const reviewContext = {
  dom: {
    reviewScoreLabelEl: { textContent: "" },
    decreaseReviewBtnEl: makeButton(),
    resetReviewBtnEl: makeButton(),
    increaseReviewBtnEl: makeButton()
  },
  callbacks: {
    getCurrentWord: () => reviewWords[reviewIndex],
    getReviewScore: (item) => item.id === "word-1" ? 2 : -1
  }
};

updateReviewButtons(reviewContext);
assert.strictEqual(reviewContext.dom.reviewScoreLabelEl.textContent, "頻度調整：2");
assert.strictEqual(reviewContext.dom.decreaseReviewBtnEl.title, "頻度調整：2");
assert.strictEqual(reviewContext.dom.increaseReviewBtnEl.title, "頻度調整：2");
assert.strictEqual(reviewContext.dom.resetReviewBtnEl.title, "頻度調整を0に戻す");

function makeWordContext(translationMode) {
  return {
    getState: () => ({
      words: [{ word: "create", meaning: "作る" }],
      index: 0,
      currentMode: "vol",
      currentVol: "vol1",
      translationMode,
      challengeMode: false,
      challengeTime: 1500,
      randomMode: false,
      historyBackStack: [],
      historyForwardStack: []
    }),
    dom: {
      wordEl: { textContent: "" },
      meaningEl: { textContent: "" },
      progressEl: { textContent: "" },
      listEl: { querySelector: () => null },
      favoriteToggleBtnEl: null,
      difficultToggleBtnEl: null,
      decreaseReviewBtnEl: null,
      resetReviewBtnEl: null,
      increaseReviewBtnEl: null,
      prevHintEl: null,
      nextHintEl: null
    },
    callbacks: {
      clearMeaningRevealTimer() {},
      clearAutoSpeakTimer() {},
      clearAutoPlayTimer() {},
      getCurrentWord: () => ({ word: "create", meaning: "作る" }),
      persistCurrentIndex() {},
      loadPronunciation() {},
      isFavorite: () => false,
      isDifficult: () => false,
      getReviewScore: () => 0
    }
  };
}

const normalWordContext = makeWordContext(false);
renderCurrentWord(normalWordContext);
assert.strictEqual(normalWordContext.dom.wordEl.textContent, "create");
assert.strictEqual(normalWordContext.dom.meaningEl.textContent, "作る");

const translatedWordContext = makeWordContext(true);
renderCurrentWord(translatedWordContext);
assert.strictEqual(translatedWordContext.dom.wordEl.textContent, "作る");
assert.strictEqual(translatedWordContext.dom.meaningEl.textContent, "create");

reviewIndex = 1;
updateReviewButtons(reviewContext);
assert.strictEqual(reviewContext.dom.reviewScoreLabelEl.textContent, "頻度調整：-1");
assert.strictEqual(reviewContext.dom.decreaseReviewBtnEl.title, "頻度調整：-1");
assert.strictEqual(reviewContext.dom.increaseReviewBtnEl.title, "頻度調整：-1");

console.log("All UI tests passed.");
