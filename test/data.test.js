import assert from "assert";
import {
  clearWordsCache,
  fetchWordsByVol,
  getSheetFetchUrl,
  parseCsv,
  parseCsvToWords,
  parseCsvToWordsByVol,
  SHEET_URL
} from "../data.js";

const sampleCsv = `\ufeffword,meaning\r\nhello,こんにちは\r\n"good,bye","さようなら"\r\n"quote""test",テスト\r\n`;

const expectedRows = [
  ["word", "meaning"],
  ["hello", "こんにちは"],
  ["good,bye", "さようなら"],
  ["quote\"test", "テスト"]
];

const parsedRows = parseCsv(sampleCsv);
assert.deepStrictEqual(parsedRows, expectedRows, "parseCsv should correctly parse quoted CSV rows and normalize line endings");

const leveledCsv = `word,meaning,level\r\ncreate,作る,1\r\nimprove,改善する,2\r\npractice,練習する,2\r\nmemory,記憶,3\r\nefficient,効率的な,4\r\nunknown,未分類,5\r\n`;

const parsedWordsByVol = parseCsvToWordsByVol(leveledCsv);
assert.deepStrictEqual(
  Object.fromEntries(Object.entries(parsedWordsByVol).map(([volName, words]) => [volName, words.map((item) => item.word)])),
  {
    vol1: ["create"],
    vol2: ["improve", "practice"],
    vol3: ["memory"],
    vol4: ["efficient"]
  },
  "parseCsvToWordsByVol should group one sheet by level and skip unknown levels"
);

const parsedLevelOneWords = parseCsvToWords(leveledCsv, "vol1");
assert.deepStrictEqual(parsedLevelOneWords, [
  {
    id: "create",
    word: "create",
    meaning: "作る",
    sourceVol: "vol1"
  }
]);

const parsedLevelTwoWords = parseCsvToWords(leveledCsv, "vol2");
assert.deepStrictEqual(parsedLevelTwoWords, [
  {
    id: "improve",
    word: "improve",
    meaning: "改善する",
    sourceVol: "vol2"
  },
  {
    id: "practice",
    word: "practice",
    meaning: "練習する",
    sourceVol: "vol2"
  }
]);

assert.strictEqual(getSheetFetchUrl(), SHEET_URL, "normal sheet URL should not add cache busting");
assert.strictEqual(
  getSheetFetchUrl({ forceRefresh: true, cacheBust: 123 }),
  `${SHEET_URL}&_=123`,
  "force refresh should add a cache-busting query parameter"
);

const originalFetch = globalThis.fetch;
const fetchedUrls = [];
const fetchedOptions = [];
globalThis.fetch = async (url, options = {}) => {
  fetchedUrls.push(String(url));
  fetchedOptions.push(options);
  return {
    ok: true,
    text: async () => leveledCsv
  };
};

try {
  clearWordsCache();
  await fetchWordsByVol();
  await fetchWordsByVol();
  assert.strictEqual(fetchedUrls.length, 1, "fetchWordsByVol should reuse cached data by default");

  await fetchWordsByVol({ forceRefresh: true });
  assert.strictEqual(fetchedUrls.length, 2, "force refresh should bypass cached data");
  assert.strictEqual(fetchedUrls[1].includes("&_="), true, "force refresh should fetch with a cache-busting URL");
  assert.deepStrictEqual(fetchedOptions[1], { cache: "no-store" }, "force refresh should bypass the browser HTTP cache");

  clearWordsCache();
  await fetchWordsByVol();
  assert.strictEqual(fetchedUrls.length, 3, "clearWordsCache should make the next load fetch again");
} finally {
  globalThis.fetch = originalFetch;
}

console.log("All data parser tests passed.");
