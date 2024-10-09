import { styled } from "@nextui-org/react";
import { m } from "framer-motion";
import PoweredByVercel from "./PoweredByVercel";

const MainContainer = styled("main", {
  color: "#fff",
  maxWidth: "480px",
  margin: "0 auto",
  minHeight: "100vh",
  height: "-webkit-fill-available",
});

export const Main = ({ children }) => {
  return <MainContainer>{children}</MainContainer>;
};

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

export const Row = styled(m.div, {
  display: "flex",
  justifyContent: "center",
  alignIitems: "center",
});

export const Levels = styled("div", {
  margin: "0px 0 24px 0",
  display: "flex",
  flexWrap: "wrap",
  gap: "10px",
});

export const Note = styled("div", {
  borderRadius: "$xs",
  padding: "$8",

  margin: "$8",

  variants: {
    type: {
      primary: {
        backgroundColor: "$primary",
        "> p": {
          color: "$white",
          margin: "$0",
        },
      },
    },
  },
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
  backgroundColor: "var(--color-level)",

  "&:hover": {
    backgroundColor: "var(--color-level-active)",
  },

  variants: {
    won: {
      true: {
        backgroundColor: "var(--nextui-colors-success)",
      },
    },
    lost: {
      true: {
        backgroundColor: "var(--nextui-colors-error)",
      },
    },

    active: {
      true: {
        backgroundColor: "var(--color-level-active)",
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
