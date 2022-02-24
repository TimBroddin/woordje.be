import { useCallback } from "react";
import {
  Modal,
  Button,
  Card,
  Col,
  Text,
  Container,
  Link,
  Row,
  styled,
} from "@nextui-org/react";

import dynamic from "next/dynamic";

import { useSelector, useDispatch } from "react-redux";
import Image from "next/image";
import { motion } from "framer-motion";

import NextLink from "next/link";
import { copyToClipboard, getIsVictory } from "@/lib/helpers";
import {
  useDisplayGameId,
  useGameState,
  useSolution,
  useArchive,
  useIsArchive,
  useSsr,
} from "@/lib/hooks";
import { useTranslations } from "@/lib/i18n";
import { getStreak } from "@/lib/helpers";
import { hide } from "@/redux/features/modal";

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

const Results = ({ visible, toast }) => {
  const translations = useTranslations();
  const { wordLength, boardSize, gameType, hardMode, gameId } = useSelector(
    (state) => state.settings
  );
  const displayGameId = useDisplayGameId(gameId);
  const isArchive = useIsArchive(gameId);
  const streak = useSelector(getStreak);
  const timer = useSelector((state) => state.timer);
  const [gameState, setGameState] = useGameState();
  const plausible = usePlausible();
  const dispatch = useDispatch();
  const { solution: initialSolution } = useSsr();
  const { solution } = useSolution(
    {
      gameId,
      wordLength,
      gameType: "vrttaal" ? "vrttaal" : null,
    },
    initialSolution
  );

  const closeHandler = (e) => {
    dispatch(hide());
  };
  const getShareText = useCallback(
    (html = false, addHashtag = false) => {
      const header = [
        `${
          html ? translations.share_html : translations.share_text
        } #${displayGameId} x ${
          gameType === "vrttaal" ? "vrttaal" : wordLength
        }`,
      ];
      if (isArchive) {
        header.push("archief");
      }

      if (hardMode) {
        header.push(`💀 Extra moeilijk`);
      }
      header.push(
        `💡 ${
          getIsVictory(gameState) ? gameState.guesses.length : "X"
        }/${boardSize}`
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
        return `${text}${addHashtag ? "\n" + translations.share_hashtag : ""}`;
      }
    },
    [
      translations.share_html,
      translations.share_text,
      translations.share_hashtag,
      displayGameId,
      gameType,
      gameState,
      boardSize,
      streak,
      timer?.start,
      timer.value,
      wordLength,
      hardMode,
      isArchive,
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
        {solution?.meaning ? (
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
        <Text h2 css={{ fontSize: "$sm", textAlign: "center" }}>
          Deel je score
        </Text>

        <Container
          justify="center"
          display="flex"
          wrap="wrap"
          gap={2}
          css={{ gap: "$2" }}>
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
                  `${translations.url}/share/${wordLength}/${getEncodedState(
                    gameState
                  )}`
                )}`,
                "_blank"
              );
            }}>
            Facebook
          </Button>

          <Button
            size={"sm"}
            ghost
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
                  `${translations.url}/share/${wordLength}/${getEncodedState(
                    gameState
                  )}`
                )}`,
                "_blank"
              );
            }}>
            Linkedin
          </Button>

          {typeof window !== "undefined" &&
          window &&
          window.navigator?.share ? (
            <Button
              size={"sm"}
              ghost
              color="primary"
              css={{ width: "100%" }}
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
          ) : null}
        </Container>

        <p>
          Probeer ook eens met{" "}
          {[3, 4, 5, 6, 7, 8, 9, 10]
            .filter((x) => x !== wordLength)
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
