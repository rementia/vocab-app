import { SHEET_URL } from "../data.js";

(async () => {
  try {
    const res = await fetch(SHEET_URL);
    console.log("STATUS", res.status);
    for (const [key, value] of res.headers) {
      console.log(`${key}: ${value}`);
    }
  } catch (error) {
    console.error("ERROR", error && error.message ? error.message : error);
  }
})();
