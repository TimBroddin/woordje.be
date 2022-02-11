import styled from "styled-components";
import { motion } from "framer-motion";

export const Main = styled.main`
  color: #fff;
  max-width: 480px;
  margin: 0 auto;
  min-height: 100vh;
  height: -webkit-fill-available;
`;

export const InnerWrapper = styled.div`
  @media (min-width: 768px) {
    display: flex;
    gap: 30px;
    flex-wrap: wrap;
    justify-content: center;
  }
`;

export const Board = styled.div`
  transition: all 0.2s ease-in-out;
  position: relative;
  filter: ${(props) => (props.$loading ? "blur(5px)" : "none")};
`;

export const Row = styled(motion.div)`
  display: flex;
  justify-content: center;
  align-items: center;
`;

export const Letter = styled(motion.div)`
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
  border-radius: var(--nextui-radii-xs);

  position: relative;

  top: 0;
  backface-visibility: hidden;
  display: flex;
  justify-content: center;
  align-items: center;
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
