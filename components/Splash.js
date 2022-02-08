import styled from "styled-components";
import { Modal, Button, Text, Loading } from "@nextui-org/react";
import { motion } from "framer-motion";
import { useSelector, useDispatch } from "react-redux";
import { useEffect, useState } from "react";

import { hide } from "../redux/features/modal";

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
        <Text>
          De letter <Text b>{words[0].split("")[0].toUpperCase()}</Text> komt
          voor in het woord en staat op de <Text b>juiste</Text> plaats.
        </Text>

        <Board initial="hidden" animate="visible" variants={board}>
          {words[1].split("").map((letter, index) => (
            <Letter key={index} variants={item}>
              <Front />
              <Back $score={index === 2 ? "off" : "bad"}>{letter}</Back>
            </Letter>
          ))}
        </Board>
        <Text>
          De letter <Text b>{words[1].split("")[2].toUpperCase()}</Text> komt
          voor in het woord, maar staat <Text b>niet</Text> op de juiste plaats.
        </Text>
        <Board initial="hidden" animate="visible" variants={board}>
          {words[2].split("").map((letter, index) => (
            <Letter key={index} variants={item}>
              <Front />
              <Back $score="bad">{letter}</Back>
            </Letter>
          ))}
        </Board>
        <Text>Geen enkele letter komt voor in het woord.</Text>
      </div>
    );
  } else {
    return <Loading size="xl" />;
  }
};

const Splash = ({ visible }) => {
  const dispatch = useDispatch();
  const { WORD_LENGTH, BOARD_SIZE } = useSelector((state) => state.settings);
  const [words, setWords] = useState([]);

  useEffect(() => {
    fetch(`/api/demo?l=${WORD_LENGTH}`)
      .then((res) => res.json())
      .then((w) => setWords(w));
  }, [WORD_LENGTH]);

  const closeHandler = (e) => {
    dispatch(hide());
  };

  return (
    <Modal
      closeButton
      aria-labelledby="modal-title"
      open={visible}
      onClose={closeHandler}>
      <Modal.Header>
        <Text size={18}>
          Welkom bij{" "}
          <Text b size={18}>
            Woordje
          </Text>
        </Text>
      </Modal.Header>
      <Modal.Body>
        <Text>
          Raad het {WORD_LENGTH}-letterwoord in {BOARD_SIZE} beurten, of minder.
        </Text>

        <Text>
          Elke gok moet een geldig woord zijn. Gebruik enter om je woord in te
          dienen.
        </Text>
        <Text>Elke dag verschijnt er een nieuwe opgave!</Text>

        <Text h2 size={24} margin={"36px 0 10px 0"}>
          Voorbeelden
        </Text>
        <Examples words={words} />

        <Button onClick={closeHandler}>Start</Button>
      </Modal.Body>
    </Modal>
  );
};

export default Splash;
