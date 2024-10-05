// import { resolve } from "node:path";

import enTranslation from "./locales/en/translation.json";
import noTranslation from "./locales/no/translation.json";

export default {
  // This is the list of languages your application supports, the last one is your
  // fallback language
  supportedLngs: ["no", "en"],

  // This is the language you want to use in case
  // the user language is not in the supportedLngs
  fallbackLng: "en",

  // The default namespace of i18next is "translation", but you can customize it
  defaultNS: "translation",

  // backend: { loadPath: resolve("./app/i18n/locales/{{lng}}/{{ns}}.json") },

  // These are the translation files we created, `translation` is the namespace
  // we want to use, we'll use this to include the translations in the bundle
  // instead of loading them on-demand
  // Passing `resources` to the `i18next` configuration, avoids using a backend
  resources: {
    en: { translation: enTranslation },
    no: { translation: noTranslation },
  },
};
