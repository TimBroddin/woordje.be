import { getGameId } from "../lib/gameId";
import { NextSeo } from "next-seo";

const Seo = ({ letters }) => {
  const CORRECTED_GAME_ID = getGameId() - 1;
  return (
    <NextSeo
      title={`Woordje.be #${CORRECTED_GAME_ID} - nederlandstalige Wordle - ${letters} letters`}
      description="Een dagelijks woordspelletje."
      canonical="https://www.woordje.be/"
      openGraph={{
        url: "https://www.woordje.be/",
        title: "Woordje.be",
        description:
          "Een dagelijks woordspelletje gebaseerd op Wordle. De Vlaamse Wordle, voor België en Nederland.",
        images: [
          {
            url: "https://www.woordje.be/twitter.png",
            width: 1200,
            height: 630,
            alt: "Woordje.be",
            type: "image/png",
          },
        ],
        site_name: "Woordje.be",
      }}
      twitter={{
        handle: "@timbroddin",
        cardType: "summary",
      }}
    />
  );
};

export default Seo;
