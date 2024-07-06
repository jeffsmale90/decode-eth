const { keccak256, decodeAbiParameters } = require("viem");
const { readFileSync, readdirSync, statSync } = require("fs");
const { join } = require("path");

const [, , dir, encodedReason] = process.argv;
if (!dir || !encodedReason) {
  console.error("Usage: node script.js <directory> <encodedReason>");
  process.exit(1);
}
console.log(`Loading ABI files from ${dir}`);
console.log();
process.stdout.write("Searching...    ");
const processIndicator = {
  i: 0,
  chars: ["|", "/", "-", "\\", "|"],

  increment: () => {
    process.stdout.moveCursor(-2);
    process.stdout.write(processIndicator.chars[processIndicator.i] + " ");
    processIndicator.i =
      (processIndicator.i + 1) % processIndicator.chars.length;
  },
  clear: () => {
    process.stdout.moveCursor(-2);
    process.stdout.write("  ");
    console.log();
    console.log();
  },
};

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
    processIndicator.increment();
    const filePath = join(dir, file);
    const stats = statSync(filePath);
    if (stats.isDirectory()) {
      walkDirectory(filePath);
    } else if (stats.isFile() && file.endsWith(".json")) {
      if (processFile(filePath)) {
        process.exit(0);
      }
    }
  });
}

// Process a single JSON file
function processFile(file) {
  const contents = readFileSync(file, { encoding: "utf8" });
  let abi;
  try {
    const json = JSON.parse(contents);
    abi = json.abi;
  } catch (error) {
    return;
  }

  if (abi === undefined) {
    return;
  }

  // Iterate through ABI and find matching error item
  for (const item of abi) {
    if (item.type === "error") {
      const selector = getErrorSelector(item);
      if (encodedReason.startsWith(selector)) {
        const paddedName = padRight(item.name, item.name.length);

        processIndicator.clear();

        console.log(`Selector found in: ${file}`);
        console.log(`Error: ${paddedName} Selector: ${selector}`);
        try {
          const decoded = decodeAbiParameters(
            item.inputs,
            "0x" + encodedReason.slice(10)
          );

          console.table(decoded);
        } catch (error) {
          console.error("Error decoding parameters");
        }
        return true;
      }
    }
  }
}

// Start walking the directory from the provided path
walkDirectory(dir);

// fallback to revert string
try {
  const decoded = decodeAbiParameters(
    [{ type: "string" }],
    `0x${encodedReason.slice(10)}`
  );
  console.table(decoded);
} catch (er) {
  processIndicator.clear();
  console.log("Not found in any ABI files.");
}
