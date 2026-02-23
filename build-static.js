const fs = require("fs");
const path = require("path");

const ROOT_DIR = __dirname;
const OUTPUT_DIR = path.join(ROOT_DIR, "public");

// Files and folders required for static hosting.
const STATIC_ENTRIES = [
  "index.html",
  "thank-you.html",
  "privacy.html",
  "terms.html",
  "assets",
  "css",
  "js",
];

const ensureEntryExists = (entryPath) => {
  if (!fs.existsSync(entryPath)) {
    throw new Error(`Missing required build entry: ${entryPath}`);
  }
};

const copyEntry = (entry) => {
  const sourcePath = path.join(ROOT_DIR, entry);
  const destinationPath = path.join(OUTPUT_DIR, entry);

  ensureEntryExists(sourcePath);
  fs.cpSync(sourcePath, destinationPath, { recursive: true });
};

fs.rmSync(OUTPUT_DIR, { recursive: true, force: true });
fs.mkdirSync(OUTPUT_DIR, { recursive: true });

STATIC_ENTRIES.forEach(copyEntry);

console.log(`Generated static output in ${OUTPUT_DIR}`);
