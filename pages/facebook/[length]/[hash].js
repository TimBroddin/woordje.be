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
            {Array.from({ length: parseInt(length) + 1 - rows.length }).map(
              (_, idx) => (
                <div className="row" key={`empty-idx`}>
                  {Array.from({ length: parseInt(length) }).map((_, cidx) => (
                    <div
                      className={`square incorrect`}
                      key={`empty-${idx}-${cidx}`}></div>
                  ))}
                </div>
              )
            )}
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
            background: linear-gradient(
              45deg,
              var(--nextui-colors-blue500) -20%,
              var(--nextui-colors-pink500) 50%
            );
            position: absolute;
            top: 0;
            left: 0;
            bottom: 0;
            right: 0;
          }

          main > div {
          }

          .row {
            display: flex;
            gap: 5px;
            margin-bottom: 5px;
          }

          .square {
            width: ${80 - parseInt(length) * 4}px;
            height: ${80 - parseInt(length) * 4}px;
            border: 3px solid rgba(255, 255, 255, 0.5);
            border-radius: 8px;
          }

          .square.correct {
            background-color: var(--color-good);
          }

          .square.incorrect {
            background-color: var(--color-bad);
          }

          .square.off {
            background-color: var(--color-off);
          }
        `}</style>
      </>
    );
  } else {
    return null;
  }
};

export default Facebook;
