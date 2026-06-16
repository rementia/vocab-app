import assert from "assert";
import { parseCsv, parseCsvToWords, parseCsvToWordsByVol } from "../data.js";

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

console.log("All data parser tests passed.");
