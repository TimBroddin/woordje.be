import styled from "styled-components";
import { motion } from "framer-motion";

export const Main = styled.main`
  color: #fff;
  max-width: 480px;
  margin: 0 auto;
  min-height: 100vh;
  height: -webkit-fill-available;
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
