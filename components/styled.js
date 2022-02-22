import { styled } from "@nextui-org/react";
import { motion } from "framer-motion";

export const Main = styled("main", {
  color: "#fff",
  maxWidth: "480px",
  margin: "0 auto",
  minHeight: "100vh",
  height: "-webkit-fill-available",
});

export const Board = styled("div", {
  transition: "all 0.2s ease-in-out",
  position: "relative",

  variants: {
    loading: {
      true: {
        filter: "blur(5px)",
      },
    },
  },
});

export const Row = styled(motion.div, {
  display: "flex",
  justifyContent: "center",
  alignIitems: "center",
});

export const Levels = styled("div", {
  margin: "24px 0",
  display: "flex",
  flexWrap: "wrap",
  gap: "10px",
});

export const Level = styled("a", {
  fontSize: "16px",
  color: "white",
  textDecoration: "none !important",
  borderRadius: "var(--nextui-radii-md)",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  height: "36px",
  width: "36px",
  padding: "0px",

  "&:hover": {
    backgroundColor: "var(--color-level-active)",
  },

  variants: {
    active: {
      true: {
        backgroundColor: "var(--color-level-active)",
      },
      false: {
        backgroundColor: "var(--color-level)",
      },
    },
    wide: {
      true: {
        width: "72px",
        padding: "10px",
      },
      false: {},
    },
  },
});
