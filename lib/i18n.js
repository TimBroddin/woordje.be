import { useRouter } from "next/router";

export const useTranslations = () => {
  const { locale } = useRouter();

  switch (locale) {
    case "nl-BE":
      return {
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
      };
      break;
    case "nl-NL":
      return {
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
      };
  }
};
