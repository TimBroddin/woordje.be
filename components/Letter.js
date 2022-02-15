import { styled } from "../styles/stitches.config";
import { motion } from "framer-motion";

export const LetterContainer = styled(motion.div, {
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  position: "relative",

  textAlign: "center",
  transformStyle: "preserve-3d",
});

const LetterFace = styled("div", {
  width: "calc(46px - ((var(--word-length, 6) - 6) * var(--shrink-size, 5px)))",
  height:
    "calc(44px - ((var(--word-length, 6) - 6) * var(--shrink-size, 5px)))",
  backgroundColor: "#ccc",
  fontSize:
    "calc(32px - ((var(--word-length, 6) - 6) * var(--shrink-size, 5px)))",
  fontWeight: "bold",
  textTransform: "uppercase",
  margin: "3px",
  color: "#000",
  position: "relative",
  top: 0,
  backfaceVisibility: "hidden",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",

  backgroundColor: "#ccc",

  variants: {
    focus: {
      true: {
        boxShadow: "0 0 3px 1px var(--nextui-colors-purple100)",
      },
    },
    small: {
      true: {
        width:
          "calc(36px - ((var(--word-length, 6) - 6) * var(--shrink-size, 4px)))",
        height:
          "calc(34px - ((var(--word-length, 6) - 6) * var(--shrink-size, 4px)))",
        fontSize:
          "max(14px, calc(22px - ((var(--word-length, 6) - 6) * var(--shrink-size, 4px))))",
      },
    },
  },
});

export const LetterFront = styled(LetterFace, {});

export const LetterBack = styled(LetterFace, {
  transform: "rotateY(180deg)",
  position: "absolute",
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: "var(--color-unknown)",

  variants: {
    disabled: {
      true: {
        backgroundColor: "var(--color-bad)",
      },
    },
    score: {
      bad: {
        backgroundColor: "var(--color-bad)",
      },
      good: {
        backgroundColor: "var(--color-good)",
      },
      off: {
        backgroundColor: "var(--color-off)",
      },
    },
  },
});

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
      <LetterFront focus={focus} style={radius} disabled={disabled}>
        {children}
      </LetterFront>
      <LetterBack style={radius} disabled={disabled} score={score}>
        {children}
      </LetterBack>
    </LetterContainer>
  );
};

export default Letter;
