import styled from "styled-components";
import { useEffect } from "react";
import { useGameState, useBrand } from "../lib/hooks";

const Wrapper = styled.div`
  margin-top: 10px;
  padding: 0px 5px;

  @media (min-width: 480px) {
    margin-left: calc(-100vw / 2 + 480px / 2);
    margin-right: calc(-100vw / 2 + 480px / 2);
  }
  @media (min-width: 768px) {
    width: 768px;
    margin-left: calc(-768px / 2 + 480px / 2);
    margin-right: calc(-768px / 2 + 480px / 2);
  }
`;
const Row = styled.div`
  display: flex;
  justify-content: center;
  margin-bottom: 2px;
`;
const Letter = styled.div`
  padding: 5px 2px;
  flex-grow: 1;
  flex-basis: 0;
  max-width: ${(props) => (props.$isBigger ? "calc(20% + 10px)" : "10%")};
  touch-action: manipulation;
  -webkit-touch-callout: none;
  -webkit-tap-highlight-color: rgba(0, 0, 0, 0);

  user-select: none;
  > span {
    display: block;
    color: var(--nextui-colors-text);
    font-weight: bold;
    padding: 5px;
    border: 1px solid var(--keyboard-border-color);
    border-radius: var(--nextui-radii-sm);
    flex: 1;
    text-align: center;
    height: 50px;
    background-color: ${(props) =>
      props.$score === "good"
        ? "var(--color-good)"
        : props.$score === "bad"
        ? "var(--color-bad)"
        : props.$score === "off"
        ? "var(--color-off)"
        : "var(--color-unknown)"};
    cursor: ${(props) => (props.$disabled ? "not-allowed" : "pointer")};
    display: flex;
    justify-content: center;
    align-items: center;
    touch-action: manipulation;
    -webkit-touch-callout: none;
    -webkit-tap-highlight-color: rgba(0, 0, 0, 0);

    user-select: none;
  }
`;

const Keyboard = ({ onPress, onBackspace, onSubmit }) => {
  const [gameState] = useGameState();
  const brand = useBrand();

  const letterRows = brand.keyboard.map((row) => row.split(""));

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
                $score={used[l]}
                $disabled={used[l] === "bad"}>
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
              $isBigger={true}>
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
              $isBigger={true}>
              <span>ENTER</span>
            </Letter>
          )}
        </Row>
      ))}
    </Wrapper>
  );
};

export default Keyboard;
