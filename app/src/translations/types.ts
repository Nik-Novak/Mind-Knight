import {en} from './languageStrings/en';
import * as languageStrings from './languageStrings'; 
// export const supportedLocalesArray = ["en", "es", "fr"] as const;
// export type SupportedLocales = (typeof supportedLocalesArray)[number];
type SupportedLocales = keyof typeof languageStrings;
export const supportedLocalesArray = Object.keys(languageStrings) as SupportedLocales[];

export type Translations = {
  [key in SupportedLocales]: LanguageStrings;
};

export type LanguageStrings = Record<keyof typeof en,string>;
