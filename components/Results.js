import { useCallback } from "react";
import {
  Modal,
  Button,
  Card,
  Grid,
  Text,
  Container,
  Link,
  styled,
} from "@nextui-org/react";

import dynamic from "next/dynamic";

import { useSelector, useDispatch } from "react-redux";
import Image from "next/image";
import { motion } from "framer-motion";

import NextLink from "next/link";
import { copyToClipboard, getIsVictory } from "../lib/helpers";
import { useGameState, useBrand, useCorrectedGameId } from "../lib/hooks";
import { getStreak } from "../lib/helpers";
import { hide } from "../redux/features/modal";

import { usePlausible } from "next-plausible";

const LazyLoadMarkDown = dynamic(() => import("./Markdown"));

const ShareText = styled("div", {
  marginBottom: "20px",
  fontSize: "16px",
  background: "#fff",
  color: "#000",
  userSelect: "all",
  padding: "5px",
  whiteSpace: "pre-wrap",
  lineHeight: "17px",
  border: "3px solid #000",
  textAlign: "center",
});

const Streak = styled(motion.h4, {
  fontSize: "22px",
  margin: 0,
  marginBottom: "10px",
  textAlign: "center",
});

const IconImage = styled(Image, {
  marginRight: "15px",
});

const Icon = ({ src, alt, width = 20, height = 20 }) => (
  <IconImage src={src} width={width} height={height} alt={alt} />
);

const Results = ({ solution, visible, toast }) => {
  const CORRECTED_GAME_ID = useCorrectedGameId();
  const brand = useBrand();
  const { WORD_LENGTH, BOARD_SIZE, gameType } = useSelector(
    (state) => state.settings
  );
  const streak = useSelector(getStreak);
  const timer = useSelector((state) => state.timer);
  const [gameState, setGameState] = useGameState();
  const plausible = usePlausible();
  const dispatch = useDispatch();

  const closeHandler = (e) => {
    dispatch(hide());
  };
  const getShareText = useCallback(
    (html = false, addHashtag = false) => {
      const header = [
        `${html ? brand.share_html : brand.share_text} #${CORRECTED_GAME_ID}`,
      ];
      if (gameType === "vrttaal") {
        header.push(`VRT Taal`);
      } else {
        if (WORD_LENGTH != 6) {
          header.push(`(${WORD_LENGTH} letters)`);
        }
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
        return `${text}${addHashtag ? "\n" + brand.share_hashtag : ""}`;
      }
    },
    [
      brand.share_html,
      brand.share_text,
      brand.share_hashtag,
      CORRECTED_GAME_ID,
      gameType,
      gameState,
      BOARD_SIZE,
      streak,
      timer?.start,
      timer.value,
      WORD_LENGTH,
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
    <Modal
      closeButton
      aria-labelledby="modal-title"
      open={visible}
      onClose={closeHandler}>
      <Modal.Header>
        <Text>
          Het woord is <Text b>{solution?.word}</Text>
        </Text>
      </Modal.Header>
      <Modal.Body>
        {solution.meaning ? (
          <Card>
            <Text>
              <Text b>Betekenis:</Text>{" "}
              <LazyLoadMarkDown text={solution.meaning} />
            </Text>
          </Card>
        ) : null}

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
        <Container justify="center" display="flex">
          <Button ghost auto onClick={onCopyToClipboard}>
            📋 Kopieer
          </Button>
        </Container>
        <Text h2 css={{ fontSize: "$sm" }}>
          Deel je score
        </Text>

        <Grid.Container gap={1}>
          <Grid sm={6}>
            <Button
              size={"sm"}
              ghost
              color="primary"
              css={{ width: "100%" }}
              icon={<Icon src={"/icons/twitter.svg"} alt="Twitter" />}
              onClick={(e) => {
                plausible("Share", { props: { method: "twitter" } });
                window.open(
                  `https://twitter.com/intent/tweet?text=${encodeURIComponent(
                    getShareText(false, true)
                  )}`,
                  "_blank"
                );
              }}>
              Twitter
            </Button>
          </Grid>
          <Grid sm={6}>
            <Button
              size={"sm"}
              ghost
              color="primary"
              css={{ width: "100%" }}
              icon={<Icon src={"/icons/facebook.svg"} alt="Facebook" />}
              onClick={(e) => {
                plausible("Share", { props: { method: "facebook" } });
                window.open(
                  `https://www.facebook.com/share.php?u=${encodeURIComponent(
                    `${brand.url}/share/${WORD_LENGTH}/${getEncodedState(
                      gameState
                    )}`
                  )}`,
                  "_blank"
                );
              }}>
              Facebook
            </Button>
          </Grid>
          <Grid sm={6}>
            <Button
              size={"sm"}
              ghost
              bordered
              color="primary"
              css={{ width: "100%" }}
              icon={<Icon src={"/icons/whatsapp.svg"} alt="Whatsapp" />}
              onClick={(e) => {
                plausible("Share", { props: { method: "whatsapp" } });
                window.open(
                  `https://api.whatsapp.com/send?text=${encodeURIComponent(
                    getShareText(false, true)
                  )}`,
                  "_blank"
                );
              }}>
              Whatsapp
            </Button>
          </Grid>
          <Grid sm={6}>
            <Button
              size={"sm"}
              ghost
              color="primary"
              css={{ width: "100%" }}
              icon={<Icon src={"/icons/linkedin.svg"} alt="Linkedin" />}
              onClick={(e) => {
                plausible("Share", { props: { method: "linkedin" } });
                window.open(
                  `https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(
                    `${brand.url}/share/${WORD_LENGTH}/${getEncodedState(
                      gameState
                    )}`
                  )}`,
                  "_blank"
                );
              }}>
              Linkedin
            </Button>
          </Grid>
          {typeof window !== "undefined" &&
          window &&
          window.navigator?.share ? (
            <Grid sm={12}>
              <Button
                size={"sm"}
                icon={<Icon src={"/icons/share.svg"} alt="Share" />}
                onClick={(e) => {
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
                Andere ...
              </Button>
            </Grid>
          ) : null}
        </Grid.Container>

        <p>
          Probeer ook eens met{" "}
          {[3, 4, 5, 6, 7, 8, 9, 10]
            .filter((x) => x !== WORD_LENGTH)
            .map((x, i) => (
              <span key={`link-${x}`}>
                <NextLink passHref href={`/speel/${x}`}>
                  <Link
                    onClick={(e) => {
                      dispatch(hide());
                    }}>
                    {x}
                  </Link>
                </NextLink>
                {i < 5 ? ", " : i < 6 ? " of " : ""}
              </span>
            ))}{" "}
          letters.
          <br />
          Of{" "}
          <Link
            href="#"
            onClick={(e) => {
              e.preventDefault();
              dispatch(hide());
              setGameState({ guesses: [] });
            }}>
            probeer opnieuw
          </Link>
          .
        </p>
      </Modal.Body>
    </Modal>
  );
};

export default Results;
