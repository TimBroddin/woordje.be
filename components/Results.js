import { useEffect, useState, useCallback } from "react";
import { useSelector } from "react-redux";

import styled, { keyframes } from "styled-components";
import { motion } from "framer-motion";

import Link from "next/link";
import { copyToClipboard, getIsVictory } from "../lib/helpers";
import { getGameId } from "../lib/gameId";
import { useGameState } from "../lib/hooks";
import { getStreak } from "../lib/helpers";

const ModalWrapper = styled.div`
  position: absolute;
  top: 0;
  height: 100%;
  margin: auto;
  width: 100vw;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const Summary = styled.div`
  position: relative;
  width: 300px;
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(5px);
  text-align: center;
  padding: 25px 15px;
  font-size: 12px;
  color: black;
  border-radius: 15px;
  box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.5);

  h1 {
    font-size: 16px;
    margin-top: 10px;
    margin-bottom: 10px;
    text-align: center;
    line-height: 1.4;
    small {
      font-size: 9px;
    }
  }

  h2 {
    text-transform: uppercase;
    font-size: 14px;
  }

  button,
  a.share {
    padding: 5px;
    background: #fff;
    color: white;
    border: 1px solid #000;
    cursor: pointer;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    font-weight: bold;
    text-transform: uppercase;
    background: #2980b9;
    margin-bottom: 5px;
    border-radius: 5px;
    font-size: 14px;
    text-decoration: none;
  }

  a {
    text-decoration: underline;
  }
`;

const ShareText = styled.div`
  margin-bottom: 20px;
  font-size: 14px;
  background: #fff;
  color: #000;
  user-select: all;
  padding: 10px;
  white-space: pre-wrap;
  line-height: 14px;
  border: 3px solid #000;
`;

const CloseModal = styled.a`
  position: absolute;
  right: 10px;
  top: 10px;
  display: inline-flex;
  border-radius: 50%;
  background-color: black;
  color: white;
  width: 20px;
  height: 20px;
  align-items: center;
  justify-content: center;
  text-decoration: none !important;
  font-weight: bold;
`;

const Redact = styled.span`
  background-color: black;
  color: white;
  padding: 3px 2px;
  cursor: pointer;
  font-size: 22px;

  strong {
    filter: blur(${(props) => (props.redacted ? "6px" : "0px")});
    transition: 1s all;
  }
`;

const Streak = styled(motion.h4)`
  font-size: 22px;
  margin: 0;
  margin-bottom: 10px;
`;

const Results = ({ solutions, close, toast }) => {
  const CORRECTED_GAME_ID = getGameId() - 1;
  const { WORD_LENGTH, BOARD_SIZE } = useSelector((state) => state.settings);
  const streak = useSelector(getStreak);
  const timer = useSelector((state) => state.timer);
  const [gameState, setGameState] = useGameState();
  const [redacted, setRedacted] = useState(true);

  const getShareText = useCallback(
    (html = false, addHashtag = false) => {
      const header = [
        `${
          html ? '<a href="https://woordje.be">Woordje.be</a>' : "woordje.be"
        } #${CORRECTED_GAME_ID}`,
      ];
      if (WORD_LENGTH != 6) {
        header.push(`(${WORD_LENGTH} letters)`);
      }
      header.push(
        `💡 ${
          getIsVictory(gameState) ? gameState.guesses.length : "X"
        }/${BOARD_SIZE}`
      );
      if (streak > 1) {
        header.push(`🎳 ${streak}`);
      }

      if (timer?.start && timer?.value && getIsVictory(gameState)) {
        header.push(
          `🕑 ${
            timer.value / 1000 > 3
              ? Math.round(timer.value / 1000)
              : (timer.value / 1000).toFixed(2)
          }s`
        );
      }

      const text = `${header.join(" ▪️ ")}
        
${gameState.guesses
  .map((line) => {
    return line
      .map((item) => {
        return item.score === "good"
          ? "🟩"
          : item.score === "off"
          ? "🟨"
          : "⬛️";
      })
      .join("");
  })
  .join("\n")}`;
      if (html) {
        return text.replace(/\n/g, "<br>");
      } else {
        return `${text}${addHashtag ? "\n#woordje" : ""}`;
      }
    },
    [BOARD_SIZE, CORRECTED_GAME_ID, WORD_LENGTH, gameState]
  );

  const getEncodedState = useCallback(() => {
    return gameState.guesses
      .map((line) =>
        line
          .map((item) =>
            item.score === "good" ? "V" : item.score === "off" ? "X" : "0"
          )
          .join("")
      )
      .join("");
  }, [gameState]);

  const onCopyToClipboard = useCallback(
    (e) => {
      e.stopPropagation();
      e.preventDefault();
      if (gameState) {
        copyToClipboard({
          "text/plain": getShareText(),
          "text/html": getShareText(true),
        }).then((ok) => {
          if (ok) {
            toast.success("Gekopieerd!", { id: "clipboard" });
          } else {
            toast.error("Clipboard error", { id: "clipboard" });
          }
        });
      }
    },
    [gameState, getShareText, toast]
  );

  return (
    <ModalWrapper>
      <Summary>
        <CloseModal
          href="#close"
          onClick={(e) => {
            e.preventDefault();
            close();
          }}>
          X
        </CloseModal>
        <h1>
          Het woordje was
          <br />
          <Redact redacted={redacted} onClick={(s) => setRedacted((s) => !s)}>
            <strong>{solutions[WORD_LENGTH - 3]}</strong>
          </Redact>
          <br />
          <small>(klik om te zien)</small>
        </h1>
        {streak > 1 ? (
          <Streak
            initial={{ opacity: 0, scale: 0, rotate: 0 }}
            animate={{ opacity: 1, scale: 1, rotate: 720 }}
            transition={{
              delay: 0.5,
              rotate: { type: "spring", stiffness: 100 },
            }}>
            STREAK: <span>{streak}</span>
          </Streak>
        ) : null}
        <ShareText onClick={(e) => e.stopPropagation()}>
          {getShareText()}
        </ShareText>

        <button onClick={onCopyToClipboard}>📋 Kopieer</button>
        <h2>Deel score</h2>
        <div className="button">
          <a
            href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(
              getShareText(false, true)
            )}`}
            rel="noreferrer"
            target="_blank"
            className="share">
            🐦 Twitter
          </a>
        </div>
        <div className="button">
          <a
            href={`https://www.facebook.com/share.php?u=${encodeURIComponent(
              `https://www.woordje.be/share/${WORD_LENGTH}/${getEncodedState(
                gameState
              )}`
            )}`}
            rel="noreferrer"
            target="_blank"
            className="share">
            👍 Facebook
          </a>
        </div>
        <div className="button">
          <a
            href={`https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(
              `https://www.woordje.be/share/${WORD_LENGTH}/${getEncodedState(
                gameState
              )}`
            )}`}
            rel="noreferrer"
            target="_blank"
            className="share">
            🤵 LinkedIn
          </a>
        </div>

        <p>
          Probeer ook eens met{" "}
          {[3, 4, 5, 6, 7, 8]
            .filter((x) => x !== WORD_LENGTH)
            .map((x, i) => (
              <span key={`link-${x}`}>
                <Link href={`/speel/${x}`}>
                  <a>{x}</a>
                </Link>
                {i < 3 ? ", " : i < 4 ? " of " : ""}
              </span>
            ))}{" "}
          letters.
          <br />
          Of{" "}
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              setGameState({ guesses: [] });
            }}>
            probeer opnieuw
          </a>
          .
        </p>
      </Summary>
    </ModalWrapper>
  );
};

export default Results;
