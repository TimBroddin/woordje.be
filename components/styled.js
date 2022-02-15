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
