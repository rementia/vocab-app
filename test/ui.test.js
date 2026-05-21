import assert from "assert";
import { updateAuthUI } from "../ui.js";

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

console.log("All UI tests passed.");
