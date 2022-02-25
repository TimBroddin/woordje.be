import { Modal, Button, Text, Loading, styled } from "@nextui-org/react";
import { m } from "framer-motion";
import { useSelector, useDispatch } from "react-redux";

import { useTranslations } from "@/lib/i18n";
import { hide } from "@/redux/features/modal";
import Letter from "@/components/Letter";
import { useStaticProps } from "@/lib/hooks";

const Board = styled(m.div, {
  display: "flex",
  justifyContent: "center",
});

const Examples = ({ words }) => {
  const { wordLength } = useSelector((state) => state.settings);

  const board = {
    show: {
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

  if (words && words.length) {
    return (
      <div style={{ "--word-length": wordLength }}>
        <Board initial="hidden" animate="show" variants={board}>
          {words[0].split("").map((letter, index) => (
            <Letter key={index} small score={index === 0 ? "good" : "bad"}>
              {letter}
            </Letter>
          ))}
        </Board>
        <Text>
          De letter <Text b>{words[0].split("")[0].toUpperCase()}</Text> komt
          voor in het woord en staat op de <Text b>juiste</Text> plaats.
        </Text>

        <Board initial="hidden" animate="show" variants={board}>
          {words[1].split("").map((letter, index) => (
            <Letter key={index} small score={index === 2 ? "off" : "bad"}>
              {letter}
            </Letter>
          ))}
        </Board>
        <Text>
          De letter <Text b>{words[1].split("")[2].toUpperCase()}</Text> komt
          voor in het woord, maar staat <Text b>niet</Text> op de juiste plaats.
        </Text>
        <Board initial="hidden" animate="show" variants={board}>
          {words[2].split("").map((letter, index) => (
            <Letter key={index} score="bad" small>
              {letter}
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
  const translations = useTranslations();
  const { wordLength, boardSize } = useSelector((state) => state.settings);
  const { demoWords } = useStaticProps();
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
            {translations.title}
          </Text>
        </Text>
      </Modal.Header>
      <Modal.Body>
        <Text>
          Raad het {wordLength}-letterwoord in {boardSize} beurten, of minder.
        </Text>

        <Text>
          Elke gok moet een geldig woord zijn. Gebruik enter om je woord in te
          dienen.
        </Text>
        <Text>Elke dag verschijnt er een nieuwe opgave!</Text>

        <Text h2 size={24} margin={"36px 0 10px 0"}>
          Voorbeelden
        </Text>
        <Examples words={demoWords} />

        <Button onClick={closeHandler}>Start</Button>
      </Modal.Body>
    </Modal>
  );
};

export default Splash;
