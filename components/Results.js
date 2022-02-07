import { useEffect, useState, useCallback } from "react";
import { useSelector } from "react-redux";
import Image from "next/image";
import styled, { keyframes } from "styled-components";
import { motion } from "framer-motion";

import Link from "next/link";
import { copyToClipboard, getIsVictory } from "../lib/helpers";
import { getGameId } from "../lib/gameId";
import { useGameState } from "../lib/hooks";
import { getStreak } from "../lib/helpers";

import Statistics from "./Statistics";
import { usePlausible } from "next-plausible";
import {
  ModalWrapper,
  Summary,
  Inner,
  Face,
  CloseModal,
  Button,
  ButtonRow,
} from "./styled";

const Front = styled(Face)``;

const Back = styled(Face)`
  transform: rotateY(180deg);
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
`;

const ShareText = styled.div`
  margin-bottom: 20px;
  font-size: 13px;
  background: #fff;
  color: #000;
  user-select: all;
  padding: 5px;
  white-space: pre-wrap;
  line-height: 14px;
  border: 3px solid #000;
`;

const Redact = styled.span`
  background-color: var(--text-primary);
  color: var(--text-primary-inverse);
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
  backface-visibility: hidden;
`;

const ShareButton = styled(Button)`
  background: var(--color-share-button);
`;

const IconImage = styled(Image)`
  margin-right: 15px;
`;

const Icon = ({ src, alt, width = 20, height = 20 }) => (
  <IconImage src={src} width={width} height={height} alt={alt} />
);

const Results = ({ solutions, close, toast }) => {
  const CORRECTED_GAME_ID = getGameId() - 1;
  const { WORD_LENGTH, BOARD_SIZE } = useSelector((state) => state.settings);
  const streak = useSelector(getStreak);
  const timer = useSelector((state) => state.timer);
  const [gameState, setGameState] = useGameState();
  const [redacted, setRedacted] = useState(true);
  const [showStats, setShowStats] = useState(false);
  const plausible = usePlausible();

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
    [
      BOARD_SIZE,
      CORRECTED_GAME_ID,
      WORD_LENGTH,
      gameState,
      streak,
      timer?.start,
      timer.value,
    ]
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
        <Inner
          initial={{ rotateY: 0 }}
          animate={{ rotateY: showStats ? 180 : 0 }}
          transition={{ type: "spring", duration: 0.8 }}>
          <Front>
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
              <Redact
                redacted={redacted}
                onClick={(s) => setRedacted((s) => !s)}>
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
            <ButtonRow>
              <button onClick={onCopyToClipboard}>📋 Kopieer</button>

              <button
                onClick={() => {
                  plausible("Statistics");
                  setShowStats(true);
                }}>
                📈 Statistieken
              </button>
            </ButtonRow>
            <h2>Deel je score</h2>
            <ButtonRow>
              <ShareButton
                href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(
                  getShareText(false, true)
                )}`}
                onClick={(e) =>
                  plausible("Share", { props: { method: "twitter" } })
                }
                rel="noreferrer"
                target="_blank">
                <Icon src={"/icons/twitter.svg"} alt="Twitter" /> Twitter
              </ShareButton>
              <ShareButton
                href={`https://www.facebook.com/share.php?u=${encodeURIComponent(
                  `https://www.woordje.be/share/${WORD_LENGTH}/${getEncodedState(
                    gameState
                  )}`
                )}`}
                onClick={(e) =>
                  plausible("Share", { props: { method: "facebook" } })
                }
                rel="noreferrer"
                target="_blank">
                <Icon src={"/icons/facebook.svg"} alt="Facebook" /> Facebook
              </ShareButton>
            </ButtonRow>
            <ButtonRow>
              <ShareButton
                href={`https://api.whatsapp.com/send?text=${encodeURIComponent(
                  getShareText(false, true)
                )}`}
                onClick={(e) =>
                  plausible("Share", { props: { method: "whatsapp" } })
                }
                rel="noreferrer"
                target="_blank">
                <Icon src={"/icons/whatsapp.svg"} alt="Whatsapp" /> WhatsApp
              </ShareButton>

              <ShareButton
                href={`https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(
                  `https://www.woordje.be/share/${WORD_LENGTH}/${getEncodedState(
                    gameState
                  )}`
                )}`}
                onClick={(e) =>
                  plausible("Share", { props: { method: "linkedin" } })
                }
                rel="noreferrer"
                target="_blank">
                <Icon
                  src={"/icons/linkedin.svg"}
                  alt="LinkedIn"
                  width={24}
                  height={24}
                />{" "}
                LinkedIn
              </ShareButton>
            </ButtonRow>
            {window && window.navigator?.share ? (
              <ButtonRow>
                <ShareButton
                  href={`#webshare`}
                  onClick={(e) => {
                    e.preventDefault();
                    if (window.navigator.share) {
                      plausible("Share", { props: { method: "webshare" } });
                      window.navigator
                        .share({
                          text: getShareText(false, true),
                        })
                        .then(() => {})
                        .catch((e) => {});
                    }
                  }}>
                  <Icon
                    src={"/icons/share.svg"}
                    alt="Share"
                    width={24}
                    height={24}
                  />{" "}
                  Andere ...
                </ShareButton>
              </ButtonRow>
            ) : null}
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
          </Front>
          <Back>
            <CloseModal
              href="#close"
              onClick={(e) => {
                e.preventDefault();
                close();
              }}>
              X
            </CloseModal>
            <Statistics close={(e) => setShowStats(false)} />
          </Back>
        </Inner>
      </Summary>
    </ModalWrapper>
  );
};

export default Results;
