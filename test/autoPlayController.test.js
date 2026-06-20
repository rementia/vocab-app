import assert from "assert";
import { createAutoPlayController } from "../autoPlayController.js";

let currentTime = 1000;
let nextCalls = 0;
let speakCalls = 0;
let savedMode = "";
let updated = 0;
const timers = [];

const originalDateNow = Date.now;
const originalSetTimeout = globalThis.setTimeout;
const originalClearTimeout = globalThis.clearTimeout;

Date.now = () => currentTime;
globalThis.setTimeout = (handler, delay) => {
  const timer = { handler, delay, cleared: false };
  timers.push(timer);
  return timer;
};
globalThis.clearTimeout = (timer) => {
  if (timer) timer.cleared = true;
};

const controller = createAutoPlayController({
  getState: () => ({
    currentMode: "vol",
    currentVol: "vol1",
    index: 0,
    words: [{ id: "a" }],
    challengeMode: false,
    challengeTime: 1500,
    displayTime: 1800
  }),
  saveAutoPlayState: (mode) => { savedMode = mode; },
  updateAutoPlayButton: () => { updated += 1; },
  nextWord: () => { nextCalls += 1; },
  speakCurrentWordForSpeechSync: () => { speakCalls += 1; },
  revealCurrentMeaningImmediately: () => false,
  isSkipIgnoredTarget: () => false,
  requestFrame: (callback) => callback()
});

assert.strictEqual(controller.isActive(), false);
controller.toggle();
assert.strictEqual(controller.getMode(), "once");
assert.strictEqual(controller.isActive(), true);
assert.strictEqual(savedMode, "once");
assert.strictEqual(updated, 1);
assert.strictEqual(speakCalls, 1, "starting autoplay should trigger speech sync speech path");
assert.strictEqual(timers.at(-1).delay, 1800, "autoplay should use display time when recall mode is off");

timers.at(-1).handler();
assert.strictEqual(nextCalls, 1, "scheduled autoplay timer should advance to next word");
assert.strictEqual(controller.shouldStopOnce(0), true, "once mode should stop when it returns to its start point");

currentTime += 1000;
controller.handleSkipRequest({ target: {} });
assert.strictEqual(nextCalls, 2, "skip request should advance when not locked");

controller.stop();
assert.strictEqual(controller.getMode(), "off");
assert.strictEqual(controller.isActive(), false);
assert.strictEqual(savedMode, "off");

Date.now = originalDateNow;
globalThis.setTimeout = originalSetTimeout;
globalThis.clearTimeout = originalClearTimeout;

console.log("All auto play controller tests passed.");
