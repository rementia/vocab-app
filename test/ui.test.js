import assert from "assert";
import { updateAuthUI, updateCurrentLabel, updateReviewButtons } from "../ui.js";

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
assert.strictEqual(labelContext.dom.currentEl.textContent, "vol.4 / 頻度配列 / 乱数配列");

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
reviewIndex = 1;
updateReviewButtons(reviewContext);
assert.strictEqual(reviewContext.dom.reviewScoreLabelEl.textContent, "頻度調整：-1");
assert.strictEqual(reviewContext.dom.decreaseReviewBtnEl.title, "頻度調整：-1");
assert.strictEqual(reviewContext.dom.increaseReviewBtnEl.title, "頻度調整：-1");

console.log("All UI tests passed.");
