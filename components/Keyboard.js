import { styled } from "@nextui-org/react";
import { useEffect } from "react";
import { useGameState } from "../lib/hooks";
import { useTranslations } from "../lib/i18n";

const Wrapper = styled("div", {
  marginTop: "10px",
  padding: "0px 5px",

  "@media (min-width: 480px)": {
    marginLeft: "calc(-100vw / 2 + 480px / 2)",
    marginRight: "calc(-100vw / 2 + 480px / 2)",
  },
  "@media (min-width: 768px)": {
    width: "768px",
    marginLeft: "calc(-768px / 2 + 480px / 2)",
    marginRight: "calc(-768px / 2 + 480px / 2)",
  },
});

const Row = styled("div", {
  display: "flex",
  justifyContent: "center",
  marginBottom: "2px",
});

const Letter = styled("div", {
  padding: "5px 2px",
  flexGrow: 1,
  flexBasis: 0,
  touchAction: "manipulation",
  "-webkit-touch-callout": "none",
  "-webkit-tap-highlight-color": "rgba(0, 0, 0, 0)",
  "user-select": "none",
  maxWidth: "10%",

  "> span": {
    display: "block",
    color: "var(--nextui-colors-text)",
    fontWeight: "bold",
    padding: "5px",
    border: "1px solid var(--keyboard-border-color)",
    borderRadius: "var(--nextui-radii-sm)",
    flex: 1,
    textAalign: "center",
    height: "50px",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "var(--color-unknown)",
    variants: {},
  },

  variants: {
    isBigger: {
      true: {
        maxWidth: "calc(20% + 10px)",
      },
      false: {},
    },
    score: {
      good: {
        "> span": {
          backgroundColor: "var(--color-good)",
        },
      },
      bad: {
        "> span": {
          backgroundColor: "var(--color-bad)",
        },
      },
      off: {
        "> span": {
          backgroundColor: "var(--color-off)",
        },
      },
    },
  },
});

const Keyboard = ({ onPress, onBackspace, onSubmit }) => {
  const [gameState] = useGameState();
  const translations = useTranslations();

  const letterRows = translations.keyboard.map((row) => row.split(""));

  const used = {};
  if (gameState && gameState.guesses) {
    gameState.guesses.forEach((row) => {
      row.forEach((r) => {
        used[r.letter] =
          used[r.letter] === "good"
            ? "good"
            : r.score === "bad" && !used[r.letter]
            ? "bad"
            : r.score !== "bad"
            ? r.score
            : used[r.letter];
      });
    });
  }

  useEffect(() => {
    const handler = (e) => {
      e.stopPropagation();
      if (e.metaKey || e.altKey || e.ctrlKey) return;
      e.preventDefault();

      if (e.key === "Backspace") {
        onBackspace();
      } else if (e.key === "Enter") {
        onSubmit();
      } else if (e.key.length === 1) {
        const key = e.key.toLowerCase();
        if (key.match(/[a-z]/g)) {
          onPress(key);
        }
      }
    };
    document.addEventListener("keydown", handler);

    return () => {
      document.removeEventListener("keydown", handler);
    };
  }, [onBackspace, onPress, onSubmit]);

  return (
    <Wrapper>
      {letterRows.map((row, rowIdx) => (
        <Row key={`keyboard.${rowIdx}`}>
          {row.map((l) => {
            return (
              <Letter
                key={`keyboard.${rowIdx}.${l}`}
                onClick={(e) => {
                  e.preventDefault();
                  onPress(l);
                  return false;
                }}
                score={used[l]}
                disabled={used[l] === "bad"}>
                <span>{l.toUpperCase()}</span>
              </Letter>
            );
          })}
          {rowIdx === 1 && (
            <Letter
              onClick={(e) => {
                e.preventDefault();
                e.nativeEvent.stopImmediatePropagation();
                onBackspace();

                return false;
              }}
              isBigger={true}>
              <span>⌫</span>
            </Letter>
          )}
          {rowIdx === 2 && (
            <Letter
              onClick={(e) => {
                e.preventDefault();
                e.nativeEvent.stopImmediatePropagation();
                onSubmit();

                return false;
              }}
              isBigger={true}>
              <span>ENTER</span>
            </Letter>
          )}
        </Row>
      ))}
    </Wrapper>
  );
};

export default Keyboard;
