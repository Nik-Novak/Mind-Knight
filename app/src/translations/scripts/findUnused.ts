// @ts-nocheck
// Initialize
const usedKeys = new Set();
let unUsedKeys;
const untranslatedStrings = new Set();

const supportedLocalesArray = require("../types").supportedLocalesArray;
const excludedKeys = [
  ...supportedLocalesArray,
  "year_ago",
  "years_ago",
  "day_ago",
  "days_ago",
  "hour_ago",
  "hours_ago",
  "minute_ago",
  "minutes_ago",
  "second_ago",
  "seconds_ago",
];

// Read files recursively from a directory
function readFiles(directory) {
  const fs = require("fs");
  const path = require("path");
  const files = fs.readdirSync(directory);
  const excludedSubPaths = ["src/translations", "src/util"];
  const includedExtensions = [".js", ".jsx", ".ts", ".tsx"];
  const excludedExtensions = [".svg"];
  for (const file of files) {
    const filePath = path.join(directory, file);
    const stat = fs.statSync(filePath);
    const fileExtension = path.extname(filePath);

    if (stat.isDirectory()) {
      readFiles(filePath);
    } else {
      if (includedExtensions.includes(fileExtension) && !excludedExtensions.includes(fileExtension)) {
        const content = fs.readFileSync(filePath, "utf-8");
        findUsedTranslations(content);

        // Skip calling findUntranslatedStrings if filePath contains any excluded subpaths
        if (!excludedSubPaths.some((subPath) => filePath.includes(subPath))) {
          findUntranslatedStrings(content);
        }
      }
    }
  }
}

function objectToTsString(obj, indent = 2) {
  let str = "{\n";
  for (const [key, value] of Object.entries(obj)) {
    str += " ".repeat(indent) + key + ": ";
    if (typeof value === "object" && !Array.isArray(value)) {
      str += objectToTsString(value, indent + 2) + ",\n";
    } else if (typeof value === "string") {
      if (value.includes('"') && value.includes("'")) {
        str += `\`${value}\`,\n`; // Use backticks if both types of quotes are in the string
      } else if (value.includes('"')) {
        str += `'${value}',\n`; // Use single quotes if the string contains a double quote
      } else {
        str += `"${value}",\n`; // Use double quotes otherwise
      }
    } else {
      str += `${value},\n`;
    }
  }
  str += " ".repeat(indent - 2) + "}";
  return str;
}

function findUsedTranslations(content) {
  const { en } = require("../en");
  // Looking for patterns like _key_here") or t('key_here') or t("key_here", {...})
  const translationFunctionMatches = content.match(/t\("([^"]+)"(?:, {.*})?\)|t\('([^']+)'(?:, {.*})?\)/g);
  if (translationFunctionMatches) {
    for (const match of translationFunctionMatches) {
      // Extract the key from the match (remove t(", "), etc.)
      const key = match.replace(/t\(["']|["'], {.*}\)|["']\)/g, "");
      if (en[key]) {
        usedKeys.add(key);
      }
    }
  }

  // Filter out any excluded keys
  unUsedKeys = Object.keys(en).filter((key) => !usedKeys.has(key) && !excludedKeys.includes(key));
}

function removeUnusedKeys() {
  const fs = require("fs");
  const path = require("path");
  const prettier = require("prettier");
  const translations = {};
  for (const lang of supportedLocalesArray) {
    translations[lang] = require(`../${lang}`);
  }
  for (const lang of supportedLocalesArray) {
    const filePath = path.resolve(__dirname, `../${lang}.ts`);
    let unUsedKeysLocale = Object.keys(translations[lang][lang]).filter((temp_key) => !usedKeys.has(temp_key) && !excludedKeys.includes(temp_key));
    // Remove unused keys from translations[lang]
    unUsedKeysLocale.forEach((temp_key) => {
      delete translations[lang][lang][temp_key];
    });

    try {
      const formattedString = objectToTsString(translations[lang][lang]);
      fs.writeFileSync(path.resolve(__dirname, `../${lang}.ts`), `export const ${lang} = ${formattedString};`);
    } catch (err: any) {
      console.error(`Failed to write the file for language '${lang}': ${err.message}`);
    }
    try {
      const fileContent = fs.readFileSync(filePath, "utf-8");
      const formattedContent = prettier.format(fileContent, {
        parser: "typescript",
      });
      fs.writeFileSync(filePath, formattedContent);
    } catch (err: any) {
      console.error(`Failed to format the file for language '${lang}': ${err.message}`);
    }
  }
}

function findUntranslatedStrings(content) {
  const standaloneStringRegex = /`([^`]+?)`|"([^"]+?)"|'([^']+?)'/g;
  let match;
  while ((match = standaloneStringRegex.exec(content)) !== null) {
    for (let i = 1; i < match.length; i++) {
      const stringToCheck = match[i];
      if (stringToCheck) {
        if (
          /^<svg|<\/svg>$/.test(stringToCheck) ||
          /^d=|viewBox=/.test(stringToCheck) ||
          /^url\('data:image\/svg\+xml/.test(stringToCheck) ||
          /xmlns="http:\/\/www\.w3\.org\/2000\/svg"/.test(stringToCheck) ||
          /^rgba\(\d+, \d+, \d+, \d+(\.\d+)?\)$/.test(stringToCheck) ||
          /translate\(-?\d+%, -?\d+%\)/.test(stringToCheck) ||
          /^[A-Z\s]+:$/.test(stringToCheck) || // Log-like statements
          /infinite|ease-in-out/.test(stringToCheck) || // Likely CSS
          /must be used within|environment variable|MONGODB_URI|API PATH|function is not yet attached|Provider is not mounted/.test(stringToCheck) || // System messages
          /[\w-]+; [\w-]+;/.test(stringToCheck) // Semicolon-separated technical terms
        )
          continue;

        // Existing conditions based on common characteristics of UI strings
        if (
          stringToCheck.length > 2 &&
          /[A-Za-z]/.test(stringToCheck[0]) &&
          /\s/.test(stringToCheck) &&
          /[A-Za-z]/.test(stringToCheck) &&
          !/\$\{.*?\}/.test(stringToCheck) &&
          !/^[A-Z0-9_]+$/.test(stringToCheck) &&
          !/^http[s]?:\/\//.test(stringToCheck)
        ) {
          untranslatedStrings.add(stringToCheck);
        }
      }
    }
  }
}

// Execute
readFiles("./src");
if (unUsedKeys?.length) removeUnusedKeys(); // Careful using this!!

// Output results
console.log("Untranslated strings:", Array.from(untranslatedStrings));
console.log("Unused translations:", unUsedKeys);
