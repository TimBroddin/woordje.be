import styled from "styled-components";
import { motion } from "framer-motion";
import { ModalWrapper, Summary, CloseModal } from "./styled";
import { useSelector, useDispatch } from "react-redux";
import { useEffect, useState } from "react";

import { hide as hideSplash } from "../redux/features/splash";
import { setWordSize } from "../redux/features/settings";

const Title = styled.h1`
  text-transform: uppercase;
  font-size: 36px;
`;

const Board = styled(motion.div)`
  display: flex;
  justify-content: center;
`;

const Row = styled(motion.div)`
  display: flex;
  justify-content: center;
  align-items: center;
`;

const Letter = styled(Row)`
  position: relative;

  text-align: center;
  transform-style: preserve-3d;
`;

const Inner = styled(motion.div)`
  background: var(--modal-background);
  text-align: center;
  padding: 25px 15px;
  font-size: 12px;
  color: var(--text-primary);
  border-radius: 15px;
  box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.5);
`;

export const LetterFace = styled.div`
  width: calc(36px - ((var(--word-length, 6) - 6) * var(--shrink-size, 5px)));
  height: calc(34px - ((var(--word-length, 6) - 6) * var(--shrink-size, 5px)));
  background-color: #ccc;
  font-size: calc(
    22px - ((var(--word-length, 6) - 6) * var(--shrink-size, 5px))
  );
  font-weight: bold;
  text-transform: uppercase;
  margin: 3px;
  color: #000;

  background-color: #ccc;

  box-shadow: ${(props) => (props.$focus ? "0 0 3px 3px cyan" : "none")};
  position: relative;

  top: 0;
  backface-visibility: hidden;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const Front = styled(LetterFace)``;

const Back = styled(LetterFace)`
  transform: rotateY(180deg);
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;

  background-color: ${(props) =>
    props.$disabled
      ? "var(--color-bad)"
      : props.$score === "bad"
      ? "var(--color-bad)"
      : props.$score === "good"
      ? "var(--color-good)"
      : props.$score === "off"
      ? "var(--color-off)"
      : "var(--color-unknown)"};
`;

const Examples = ({ words }) => {
  const { WORD_LENGTH, BOARD_SIZE } = useSelector((state) => state.settings);

  const board = {
    visible: {
      opacity: 1,
      transition: {
        when: "beforeChildren",
        staggerChildren: 0.1,
        delay: 1,
      },
    },
    hidden: {
      opacity: 1,
      transition: {
        when: "afterChildren",
      },
    },
  };

  const item = {
    visible: { rotateY: 180 },
    hidden: { rotateY: 0 },
  };

  if (words && words.length) {
    return (
      <div style={{ "--word-length": WORD_LENGTH }}>
        <Board initial="hidden" animate="visible" variants={board}>
          {words[0].split("").map((letter, index) => (
            <Letter key={index} variants={item}>
              <Front />
              <Back $score={index === 0 ? "good" : "bad"}>{letter}</Back>
            </Letter>
          ))}
        </Board>
        <p>
          De letter <strong>{words[0].split("")[0].toUpperCase()}</strong> komt
          voor in het woord en staat op de <strong>juiste</strong> plaats.
        </p>

        <Board initial="hidden" animate="visible" variants={board}>
          {words[1].split("").map((letter, index) => (
            <Letter key={index} variants={item}>
              <Front />
              <Back $score={index === 2 ? "off" : "bad"}>{letter}</Back>
            </Letter>
          ))}
        </Board>
        <p>
          De letter <strong>{words[1].split("")[2].toUpperCase()}</strong> komt
          voor in het woord, maar staat <strong>niet</strong> op de juiste
          plaats.
        </p>
        <Board initial="hidden" animate="visible" variants={board}>
          {words[2].split("").map((letter, index) => (
            <Letter key={index} variants={item}>
              <Front />
              <Back $score="bad">{letter}</Back>
            </Letter>
          ))}
        </Board>
        <p>Geen enkele letter komt voor in het woord.</p>
      </div>
    );
  } else {
    return null;
  }
};

const Splash = ({}) => {
  const dispatch = useDispatch();
  const { WORD_LENGTH, BOARD_SIZE } = useSelector((state) => state.settings);
  const [words, setWords] = useState([]);

  useEffect(() => {
    fetch(`/api/demo?l=${WORD_LENGTH}`)
      .then((res) => res.json())
      .then((w) => setWords(w));
  }, [WORD_LENGTH]);

  return (
    <ModalWrapper>
      <Summary>
        <Inner
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", duration: 0.8 }}>
          <CloseModal
            href="#close"
            onClick={(e) => {
              e.preventDefault();
              dispatch(hideSplash());
            }}>
            X
          </CloseModal>
          <Title>Woordje</Title>
          <p>
            Raad het {WORD_LENGTH}-letterwoord in {BOARD_SIZE} beurten, of
            minder.
          </p>

          <p>
            Elke gok moet een geldig woord zijn. Gebruik enter om je woord in te
            dienen.
          </p>

          <h2>Voorbeelden</h2>
          <Examples words={words} />

          <p>Elke dag verschijnt er een nieuwe opgave!</p>

          <button onClick={() => dispatch(hideSplash())}>
            Gaan met die 🍌
          </button>
        </Inner>
      </Summary>
    </ModalWrapper>
  );
};

export default Splash;
