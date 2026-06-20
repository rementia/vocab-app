const tests = [
  "./wordIdentity.test.js",
  "./data.test.js",
  "./wordList.test.js",
  "./wordOrderService.test.js",
  "./savedStateController.test.js",
  "./pronunciation.test.js",
  "./autoPlayController.test.js",
  "./speechSyncController.test.js",
  "./cloudSyncController.test.js",
  "./multipleChoice.test.js",
  "./navigation.test.js",
  "./searchController.test.js",
  "./storage.test.js",
  "./favoritesManager.test.js",
  "./difficultsManager.test.js",
  "./reviewManager.test.js",
  "./ui.test.js",
  "./events.test.js"
];

for (const testPath of tests) {
  await import(testPath);
}
