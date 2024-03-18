import { createContext, useContext, useState } from "react";
import { LanguageStrings, Translations } from "@/translations/types";
import translations from "@/translations";

interface LangContextType {
  t: (key: keyof LanguageStrings, values?: { [key: string]: any }) => string;
  lang: keyof Translations;
  setLang: (lang: keyof Translations) => void;
}

const LangContext = createContext<LangContextType | null>(null);

export const useLang = () => {
  const context = useContext(LangContext);
  if (!context) {
    throw new Error("useLang must be used within LangProvider");
  }
  return context;
};

export const LangProvider = ({ children }: any) => {
  // const lang = useSelector((state: RootState) => state.session.preferredLocale);
  const [lang, setLang] = useState<keyof Translations>('en');

  function t(key: keyof LanguageStrings, values?: { [key: string]: any }): string {
    let translation = translations[lang]?.[key] || key;
    if (!translations[lang]?.[key]) console.warn(`Missing Translation Key: ${key.toString()}} For ${lang}`);
    if (values) {
      for (const [valueKey, value] of Object.entries(values)) {
        translation = translation.replace(`{${valueKey}}`, value.toString());
      }
    }
    return translation;
  }

  return <LangContext.Provider value={{ t, lang, setLang }}>{children}</LangContext.Provider>;
};
