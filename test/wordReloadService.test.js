import assert from "assert";
import { getReloadedIndex } from "../wordReloadService.js";

const words = [
  { id: "a", word: "alpha" },
  { id: "b", word: "bravo" },
  { id: "c", word: "charlie" }
];

assert.strictEqual(
  getReloadedIndex({ words, previousIndex: 0, preserveWordId: "c" }),
  2,
  "reload should preserve the current word when its id still exists"
);

assert.strictEqual(
  getReloadedIndex({ words, previousIndex: 99, preserveWordId: "missing" }),
  2,
  "reload should clamp an out-of-range index when the current word no longer exists"
);

assert.strictEqual(
  getReloadedIndex({ words: [], previousIndex: 5, preserveWordId: "missing" }),
  0,
  "reload should keep an empty list index at 0"
);

console.log("All word reload service tests passed.");
