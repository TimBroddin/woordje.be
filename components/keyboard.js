import styled from "styled-components";
import { useEffect } from "react";

const Wrapper = styled.div`
  min-width: 100vw;
  margin: 20px 5px;

  @media (min-width: 768px) {
    padding: 0 30vw;
    order: 3;
  }
`;
const Row = styled.div`
  display: flex;
  justify-content: center;
  gap: 3px;
  margin-bottom: 3px;
`;
const Letter = styled.div`
  color: black;
  padding: 5px;
  border: 1px solid #ccc;
  border-radius: 3px;
  flex: 1;
  text-align: center;
  background-color: ${(props) =>
    props.$score === "good"
      ? "#0f0"
      : props.$score === "bad"
      ? "#ccc"
      : props.$score === "off"
      ? "yellow"
      : "white"};
`;

const Keyboard = ({ gameState, onPress, onBackspace, onSubmit }) => {
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
    document.addEventListener("keypress", (e) => {
      if (e.key === "Backspace") {
        onBackspace();
      } else if (e.key === "Enter") {
        onSubmit();
      } else {
        const key = e.key.toLowerCase();
        if (key.match(/[a-z]/g)) {
          onPress(key);
        }
      }
    });
  }, []);

  return (
    <Wrapper>
      {letterRows.map((row, rowIdx) => (
        <Row key={`keyboard.${rowIdx}`}>
          {row.map((l) => {
            const isUsed = false;
            const isDisabled = isUsed || l === " ";
            const score = isUsed ? "off" : "good";
            return (
              <Letter
                key={`keyboard.${rowIdx}.${l}`}
                onClick={() => onPress(l)}
                $score={used[l]}
                $focus={isUsed}>
                {l}
              </Letter>
            );
          })}
          {rowIdx === 1 && <Letter onClick={() => onBackspace()}>⌫</Letter>}
          {rowIdx === 2 && <Letter onClick={() => onSubmit()}>ENTER</Letter>}
        </Row>
      ))}
    </Wrapper>
  );
};

export default Keyboard;
