import { SHEET_URL } from "../data.js";

(async () => {
  try {
    const res = await fetch(SHEET_URL);
    console.log("STATUS", res.status);
    const text = await res.text();
    console.log("LENGTH", text.length);
    console.log("HEAD:\n", text.slice(0, 1000));
  } catch (error) {
    console.error("ERROR", error && error.message ? error.message : error);
  }
})();
