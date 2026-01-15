/**
 * Translation data - can be used by both server and client
 */
export const translations = {
  "nl-BE": {
    id: "woordje",
    title: "Woordje",
    url: "https://www.woordje.be",
    description:
      "Een dagelijks woordspelletje gebaseerd op Wordle. De Vlaamse Wordle, voor België en Nederland, met 3 tot 10 letters.",
    manifest: "manifest_be.json",
    share_html: '<a href="https://woordje.be">woordje.be</a>',
    share_text: "woordje.be",
    share_hashtag: "#woordje",
    local: "Vlaamse",
    alternate_lang: "nl-nl",
    alternate_url: "https://www.woordol.nl",
    alternate_flag: "🇳🇱",
    alternate_title: "Woordol.nl",
    alternate_cta: "Nederlander? Check ook ",
    plausible: "woordje.be",
    keyboard: ["azertyuiop", "qsdfghjklm", "wxcvbn"],
  },
  "nl-NL": {
    id: "woordol",
    title: "Woordol",
    url: "https://www.woordol.nl",
    description:
      "Een dagelijks woordspelletje gebaseerd op Wordle. De Nederlandse Wordle, met 3 tot 10 letters.",
    manifest: "manifest_nl.json",
    share_html: '<a href="https://woordol.nl">Woordol.nl</a>',
    share_text: "woordol.nl",
    share_hashtag: "#woordol",
    local: "Hollandse",
    alternate_lang: "nl-be",
    alternate_url: "https://www.woordje.be",
    alternate_flag: "🇧🇪",
    alternate_title: "Woordje.be",
    alternate_cta: "Belg? Check ook ",
    plausible: "woordol.nl",
    keyboard: ["qwertyuiop", "asdfghjklm", "zxcvbn"],
  },
};

/**
 * Get translations directly from locale string
 * For client components or when locale is known
 */
export function getTranslationsFromLocale(locale) {
  return translations[locale] || translations["nl-BE"];
}

/**
 * Get locale from domain name
 */
export function getLocaleFromHostname(hostname) {
  const baseHostname = hostname.split(":")[0];

  if (baseHostname.includes("woordol.nl")) {
    return "nl-NL";
  }
  return "nl-BE";
}
