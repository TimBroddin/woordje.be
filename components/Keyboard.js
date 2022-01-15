import styled from "styled-components";
import { useEffect } from "react";
import { useGameState } from "../data/context";

const Wrapper = styled.div`
  min-width: 100vw;
  margin: 20px 0px;
  padding: 0px 5px;

  @media (min-width: 768px) {
    padding: 0 30vw;
    order: 3;
  }
`;
const Row = styled.div`
  display: flex;
  justify-content: center;
  margin-bottom: 10px;
`;
const Letter = styled.a`
  padding: 5px 2px;
  flex-grow: 1;

  > span {
    display: block;
    color: black;
    padding: 5px;
    border: 1px solid #ccc;
    border-radius: 10px;
    flex: 1;
    text-align: center;
    height: 50px;
    background-color: ${(props) =>
      props.$score === "good"
        ? "#0f0"
        : props.$score === "bad"
        ? "#666"
        : props.$score === "off"
        ? "yellow"
        : "#ccc"};
    cursor: ${(props) => (props.$disabled ? "not-allowed" : "pointer")};
    display: flex;
    justify-content: center;
    align-items: center;
    touch-action: manipulation;
  }
`;

const Keyboard = ({ onPress, onBackspace, onSubmit }) => {
  const [gameState] = useGameState();

  const letterRows = ["azertyuiop", "qsdfghjklm", "wxcvbn"].map((row) =>
    row.split("")
  );

  const used = {};
  if (gameState && gameState.state) {
    gameState.state.forEach((row) => {
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
  }, [used]);

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
                }}
                href={`#${l}`}
                $score={used[l]}
                $disabled={used[l] === "bad"}>
                <span>{l}</span>
              </Letter>
            );
          })}
          {rowIdx === 1 && (
            <Letter
              onClick={(e) => {
                e.preventDefault();
                onBackspace();
              }}
              $isBigger={true}
              href="#backspace">
              <span>⌫</span>
            </Letter>
          )}
          {rowIdx === 2 && (
            <Letter
              onClick={(e) => {
                e.preventDefault();
                onSubmit();
              }}
              href="#enter"
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
