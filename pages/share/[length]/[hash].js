import { useEffect } from "react";
import { useSelector } from "react-redux";
import { NextSeo } from "next-seo";
import { getGameId } from "../../../lib/gameId";
import { useRouter } from "next/router";
import { useCorrectedGameId } from "../../../lib/hooks";

const Facebook = ({ length, hash }) => {
  const { brand } = useSelector((state) => state.settings);
  const CORRECTED_GAME_ID = useCorrectedGameId();
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

  const title = `${brand.title} #${CORRECTED_GAME_ID} ${
    length !== 6 ? `(${length} tekens)` : ""
  } - ${tries}/${length + 1}`;

  return (
    <>
      <NextSeo
        title={title}
        description={brand.description}
        openGraph={{
          title,
          description: brand.description,
          images: [
            {
              url: `https://www.woordje.be/api/fb?length=${length}&hash=${hash}`,
              width: 1200,
              height: 630,
              alt: brand.title,
              type: "image/png",
            },
          ],
          site_name: brand.title,
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
