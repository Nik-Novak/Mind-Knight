// USAGE:
// yarn add-translation -- en '[{"key": "newKey1", "value": "New Value 1"}]'

interface TranslationPair {
  key: string;
  value: string;
}

function addTranslations(lang: string, translations: TranslationPair[]): void {
  const fs = require("fs");
  const path = require("path");
  const filePath = path.join(__dirname, "..", `${lang}.ts`);

  if (fs.existsSync(filePath)) {
    let fileContent = fs.readFileSync(filePath, "utf8");

    translations.forEach(({ key, value }) => {
      // Check if key already exists to avoid duplication
      const keyRegex = new RegExp(`\\s${key}:\\s"([^"]+)",?`, "g");
      if (!keyRegex.test(fileContent)) {
        // If the key doesn't exist, add the new translation
        fileContent = fileContent.replace(
          `${lang} = {`,
          `${lang} = {\n  ${key}: "${value}",`
        );
      }
    });

    fs.writeFileSync(filePath, fileContent, "utf8");
    console.log(`Added translations to ${lang}.ts`);
  } else {
    console.log(`File ${lang}.ts does not exist.`);
  }
}

const args = process.argv.slice(2);

if (args.length === 2) {
  const [lang, translationsJSON] = args;
  const translations: TranslationPair[] = JSON.parse(translationsJSON);
  addTranslations(lang, translations);
} else {
  console.log(
    "Usage: ts-node addTranslation.ts <lang> '<JSON string of translations>'"
  );
}
