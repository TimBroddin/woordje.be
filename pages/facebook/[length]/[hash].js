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
                {row.split("").map((char, cidx) => (
                  <div
                    className={`square ${
                      char === "V"
                        ? "correct"
                        : char === "X"
                        ? "off"
                        : "incorrect"
                    }`}
                    key={`${idx}-${cidx}`}></div>
                ))}
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
            background: linear-gradient(#330d69, #30c4cb);
          }

          main > div {
          }

          .row {
            font-size: 96px;
            line-height: 96px;
            display: flex;
            gap: 5px;
            margin-bottom: 5px;
          }

          .square {
            width: 96px;
            height: 96px;
            border: 3px solid rgba(255, 255, 255, 0.5);
            border-radius: 8px;
          }

          .square.correct {
            background-color: green;
          }

          .square.incorrect {
            background-color: black;
          }

          .square.off {
            background-color: yellow;
          }
        `}</style>
      </>
    );
  } else {
    return null;
  }
};

export default Facebook;
