const tests = [
  "./data.test.js",
  "./navigation.test.js",
  "./storage.test.js",
  "./difficultsManager.test.js",
  "./ui.test.js"
];

for (const testPath of tests) {
  await import(testPath);
}
