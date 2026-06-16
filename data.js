import { normalizeWordKey } from "./wordIdentity.js";

export const SHEET_URL = "https://docs.google.com/spreadsheets/d/17XhRsbdw5NfgGPsmkam8_B1F2mtlGMJ3Uh00l5UIIMY/export?format=csv&gid=0";
const VOL_NAMES = ["vol1", "vol2", "vol3", "vol4"];
const LEVEL_TO_VOL = {
  "1": "vol1",
  "2": "vol2",
  "3": "vol3",
  "4": "vol4",
  vol1: "vol1",
  vol2: "vol2",
  vol3: "vol3",
  vol4: "vol4"
};

let wordsByVolCache = null;

export async function fetchWithRetry(url, retryCount = 1) {
  let lastError = null;

  for (let attempt = 0; attempt <= retryCount; attempt += 1) {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      return response;
    } catch (error) {
      lastError = error;
    }
  }

  throw lastError;
}

function stripBom(text) {
  return text.charCodeAt(0) === 0xfeff ? text.slice(1) : text;
}

function normalizeLineEndings(text) {
  return text.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
}

export function parseCsv(text) {
  if (typeof text !== "string") return [];

  const normalizedText = normalizeLineEndings(stripBom(text));
  const rows = [];
  let row = [];
  let cell = "";
  let inQuotes = false;

  for (let i = 0; i < normalizedText.length; i += 1) {
    const char = normalizedText[i];
    const nextChar = normalizedText[i + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        cell += '"';
        i += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (char === "," && !inQuotes) {
      row.push(cell);
      cell = "";
      continue;
    }

    if (char === "\n" && !inQuotes) {
      row.push(cell);
      rows.push(row);
      row = [];
      cell = "";
      continue;
    }

    cell += char;
  }

  if (cell.length > 0 || row.length > 0) {
    row.push(cell);
    rows.push(row);
  }

  return rows;
}

function hasHeaderRow(row) {
  const headers = row.map((cell) => String(cell ?? "").toLowerCase().trim());
  return (
    headers.some((value) => value === "word" || value === "単語") ||
    headers.some((value) => value === "meaning" || value === "意味")
  );
}

function getColumnIndex(headers, names, fallbackIndex) {
  const index = headers.findIndex((value) => names.includes(value));
  return index >= 0 ? index : fallbackIndex;
}

function normalizeLevelToVol(level) {
  const value = String(level ?? "").toLowerCase().trim();
  const normalizedValue = value.replace(/^vol\.?\s*/, "vol");
  return LEVEL_TO_VOL[normalizedValue] || "";
}

function getTrimmedRows(text) {
  return parseCsv(text)
    .map((cols) => cols.map((col) => String(col ?? "").trim()))
    .filter((cols) => cols.some((col) => col !== ""));
}

function getCsvColumnIndexes(rows, startIndex) {
  const headers = startIndex === 1
    ? rows[0].map((cell) => String(cell ?? "").toLowerCase().trim())
    : [];

  return {
    wordIndex: getColumnIndex(headers, ["word", "単語"], 0),
    meaningIndex: getColumnIndex(headers, ["meaning", "意味"], 1),
    levelIndex: getColumnIndex(headers, ["level", "レベル"], -1)
  };
}

function createEmptyWordsByVol() {
  return Object.fromEntries(VOL_NAMES.map((volName) => [volName, []]));
}

function createWordEntry(word, meaning, sourceVol) {
  return {
    id: normalizeWordKey(word),
    word,
    meaning,
    sourceVol
  };
}

export function parseCsvToWordsByVol(text) {
  const rows = getTrimmedRows(text);

  const startIndex = rows.length > 0 && hasHeaderRow(rows[0]) ? 1 : 0;
  const { wordIndex, meaningIndex, levelIndex } = getCsvColumnIndexes(rows, startIndex);
  const wordsByVol = createEmptyWordsByVol();

  if (levelIndex < 0) return wordsByVol;

  rows.slice(startIndex).forEach((cols) => {
    const sourceVol = normalizeLevelToVol(cols[levelIndex]);
    if (!sourceVol) return;

    const word = cols[wordIndex] || "";
    if (!word) return;

    const meaning = cols[meaningIndex] || "";
    wordsByVol[sourceVol].push(createWordEntry(word, meaning, sourceVol));
  });

  return wordsByVol;
}

export function parseCsvToWords(text, volName) {
  return parseCsvToWordsByVol(text)[volName] || [];
}

async function fetchWordsByVol() {
  if (wordsByVolCache) return wordsByVolCache;

  const response = await fetchWithRetry(SHEET_URL, 1);
  const text = await response.text();
  wordsByVolCache = parseCsvToWordsByVol(text);

  return wordsByVolCache;
}

export async function fetchWordsForVol(volName) {
  const wordsByVol = await fetchWordsByVol();
  const words = wordsByVol[volName] || [];
  if (!words.length) {
    throw new Error(`No words parsed from CSV for ${volName}`);
  }
  return words;
}
