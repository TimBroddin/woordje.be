import { useEffect } from "react";
import { NextSeo } from "next-seo";
import { getGameId } from "../../../lib/gameId";
import { useRouter } from "next/router";

const Facebook = ({ length, hash }) => {
  const CORRECTED_GAME_ID = getGameId() - 1;
  const router = useRouter();
  const lines = hash.match(new RegExp(`.{1,${length}}`, "g"));
  const tries =
    lines[lines.length - 1] ===
    Array.from({ length })
      .map((x) => "V")
      .join("")
      ? lines.length
      : "X";

  useEffect(() => {
    router.push("/");
  }, [router]);

  return (
    <>
      <NextSeo
        title={`Woordje.be #${CORRECTED_GAME_ID} ${
          length !== 6 ? `(${length} tekens)` : ""
        } - ${tries}/${length + 1}`}
        description="Een dagelijks woordspelletje gebaseerd op Wordle. De Vlaamse Wordle, voor België en Nederland."
        openGraph={{
          title: `Woordje.be #${CORRECTED_GAME_ID} ${
            length !== 6 ? `(${length} tekens)` : ""
          } - ${tries}/${length + 1}`,
          description: "Een dagelijks woordspelletje gebaseerd op Wordle.",
          images: [
            {
              url: `https://www.woordje.be/api/fb?length=${length}&hash=${hash}`,
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

export async function getServerSideProps(context) {
  return {
    props: {
      length: parseInt(context.query.length),
      hash: context.query.hash,
    }, // will be passed to the page component as props
  };
}

export default Facebook;
