const { keccak256, decodeAbiParameters } = require("viem");
const { readFileSync, readdirSync, statSync } = require("fs");
const { join } = require("path");

const [, , dir, encodedReason] = process.argv;
if (!dir || !encodedReason) {
  console.error("Usage: node script.js <directory> <encodedReason>");
  process.exit(1);
}
console.log(`Loading ABI files from ${dir}`);
console.log(`Matching encoded reason: ${encodedReason}`);

// Function to get 4-byte selector for an error item
function getErrorSelector(errorItem) {
  const signature = `${errorItem.name}(${errorItem.inputs
    .map((input) => input.type)
    .join(",")})`;
  const hash = keccak256(signature);
  return hash.slice(0, 10);
}

// Function to pad the output for fixed width
function padRight(string, length) {
  return string + " ".repeat(length - string.length);
}

// Recursively walk through the directory and process JSON files
function walkDirectory(dir) {
  const files = readdirSync(dir);
  files.forEach((file) => {
    const filePath = join(dir, file);
    const stats = statSync(filePath);
    if (stats.isDirectory()) {
      walkDirectory(filePath);
    } else if (stats.isFile() && file.endsWith(".json")) {
      processFile(filePath);
    }
  });
}

// Process a single JSON file
function processFile(file) {
  const contents = readFileSync(file, { encoding: "utf8" });
  const { abi } = JSON.parse(contents);
  if (abi === undefined) {
    return;
  }

  // Iterate through ABI and find matching error item
  for (const item of abi) {
    if (item.type === "error") {
      const selector = getErrorSelector(item);
      if (encodedReason.startsWith(selector)) {
        const paddedName = padRight(item.name, item.name.length);
        console.log(`File: ${file}`);
        console.log(`Error: ${paddedName} Selector: ${selector}`);
        const decoded = decodeAbiParameters(
          item.inputs,
          "0x" + encodedReason.slice(10)
        );
        console.table(decoded);
        return;
      }
    }
  }
}

// Start walking the directory from the provided path
walkDirectory(dir);
