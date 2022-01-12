import { NextSeo } from "next-seo";
import { useRouter } from "next/router";

const Facebook = () => {
  const router = useRouter();
  if (router.query && router.query.hash) {
    const { length, hash } = router.query;

    const rows = hash.match(new RegExp(`.{1,${length}}`, "g"));
    return (
      <>
        <main>
          <div>
            {rows.map((row, idx) => (
              <div className="row" key={idx}>
                {row
                  .split("")
                  .map((char) =>
                    char === "V" ? "🟩" : char === "X" ? "🟨" : "⬛️"
                  )
                  .join("")}
              </div>
            ))}
          </div>
        </main>
        <style jsx>{`
          main {
            display: flex;
            justify-content: space-around;
            min-height: 100vh;
            min-width: 100vw;
            align-items: center;
          }

          main > div {
          }

          .row {
            font-size: 96px;
            line-height: 96px;
          }
        `}</style>
      </>
    );
  } else {
    return null;
  }
};

export default Facebook;
