import { useEffect } from "react";
import { useSelector } from "react-redux";
import { NextSeo } from "next-seo";
import { useRouter } from "next/router";
import { useDisplayGameId } from "../../../../lib/hooks";
import { useTranslations } from "@/lib/i18n";

const Facebook = ({ length, hash, gameId }) => {
  const translations = useTranslations();
  const displayGameId = useDisplayGameId(gameId);
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
    //router.push("/");
  }, [router]);

  const title = `${
    translations.title
  } #${displayGameId} x ${length} - ${tries}/${length + 1}`;

  return (
    <>
      <NextSeo
        title={title}
        description={lines.join("\n")}
        openGraph={{
          title,
          description: lines.join("\n"),
          images: [
            {
              url: `https://www.woordje.be/og.png`,
              width: 1200,
              height: 630,
              alt: translations.title,
              type: "image/png",
            },
          ],
          site_name: translations.title,
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
      gameId: context.query.gameId,
    }, // will be passed to the page component as props
  };
}

export default Facebook;
