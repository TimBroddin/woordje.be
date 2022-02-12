import styled from "styled-components";
import { motion } from "framer-motion";

export const LetterContainer = styled(motion.div)`
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;

  text-align: center;
  transform-style: preserve-3d;
`;

const LetterFace = styled.div`
  width: calc(46px - ((var(--word-length, 6) - 6) * var(--shrink-size, 5px)));
  height: calc(44px - ((var(--word-length, 6) - 6) * var(--shrink-size, 5px)));
  background-color: #ccc;
  font-size: calc(
    32px - ((var(--word-length, 6) - 6) * var(--shrink-size, 5px))
  );
  font-weight: bold;
  text-transform: uppercase;
  margin: 3px;
  color: #000;

  position: relative;

  top: 0;
  backface-visibility: hidden;
  display: flex;
  justify-content: center;
  align-items: center;

  background-color: #ccc;

  box-shadow: ${(props) =>
    props.$focus ? "0 0 3px 1px var(--nextui-colors-purple100)" : "none"};
`;

export const LetterFront = styled(LetterFace)``;

export const LetterBack = styled(LetterFace)`
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

const letterVariants = {
  hidden: {
    rotateY: 0,
  },
  show: {
    rotateY: 180,
  },
};

const Letter = ({ focus, disabled, score, radius, children }) => {
  return (
    <LetterContainer variants={letterVariants}>
      <LetterFront $focus={focus} style={radius} $disabled={disabled}>
        {children}
      </LetterFront>
      <LetterBack style={radius} $disabled={disabled} $score={score}>
        {children}
      </LetterBack>
    </LetterContainer>
  );
};

export default Letter;
