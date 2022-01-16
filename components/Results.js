import { useEffect, useState } from "react";
import { useSelector } from "react-redux";

import styled from "styled-components";
import Link from "next/link";
import { copyToClipboard, getIsVictory } from "../lib/helpers";
import { getGameId } from "../lib/gameId";
import { useGameState } from "../lib/hooks";

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
    margin-bottom: 20px;
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

const Results = ({ solutions, close }) => {
  const CORRECTED_GAME_ID = getGameId() - 1;
  const { WORD_LENGTH, BOARD_SIZE } = useSelector((state) => state.settings);
  const [gameState, setGameState] = useGameState();
  const [redacted, setRedacted] = useState(true);

  function getShareText(gameState, html = false) {
    const text = `${
      html ? '<a href="https://woordje.be">Woordje.be</a>' : "woordje.be"
    } #${CORRECTED_GAME_ID} ${
      WORD_LENGTH !== 6 ? `(${WORD_LENGTH} tekens)` : ""
    } ${getIsVictory(gameState) ? gameState.guesses.length : "X"}/${BOARD_SIZE}
  
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
      return text;
    }
  }

  function getEncodedState(gameState) {
    return gameState.guesses
      .map((line) =>
        line
          .map((item) =>
            item.score === "good" ? "V" : item.score === "off" ? "X" : "0"
          )
          .join("")
      )
      .join("");
  }

  function onCopyToClipboard(e) {
    e.stopPropagation();
    e.preventDefault();
    setGameState((gameState) => {
      if (gameState) {
        copyToClipboard({
          "text/plain": getShareText(gameState),
          "text/html": getShareText(gameState, true),
        }).then((ok) => {
          if (ok) {
            toast.success("Gekopieerd!", { id: "clipboard" });
          } else {
            toast.error("Clipboard error", { id: "clipboard" });
          }
        });
      }
      return gameState;
    });
  }

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
        <ShareText onClick={(e) => e.stopPropagation()}>
          {getShareText(gameState)}
        </ShareText>

        <button onClick={onCopyToClipboard}>📋 Kopieer</button>
        <h2>Deel score</h2>
        <div className="button">
          <a
            href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(
              getShareText(gameState)
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
              setGameState({ state: [] });
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
