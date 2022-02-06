import { getGameId } from "../lib/gameId";
import { NextSeo } from "next-seo";
import Head from "next/head";

const Seo = ({ letters }) => {
  const CORRECTED_GAME_ID = getGameId() - 1;
  return (
    <>
      <Head>
        <meta name="application-name" content="Woordje" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Woordje" />
        <meta name="mobile-web-app-capable" content="yes" />

        <link rel="apple-touch-icon" href="/favicon.png" />
        <link rel="icon" type="image/png" sizes="512x512" href="/favicon.png" />
        <link rel="manifest" href="/manifest.json" />
      </Head>
      <NextSeo
        title={`Woordje.be #${CORRECTED_GAME_ID} - nederlandstalige Wordle - ${letters} letters`}
        description="Een dagelijks woordspelletje gebaseerd op Wordle. De Vlaamse Wordle, voor België en Nederland."
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
    </>
  );
};

export default Seo;
