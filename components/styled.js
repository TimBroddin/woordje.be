import styled from "styled-components";
import { motion } from "framer-motion";

export const Main = styled.main`
  color: #fff;
  max-width: 480px;
  margin: 0 auto;
  min-height: 100vh;
  height: -webkit-fill-available;
  transition: all 0.2s ease-in-out;
  opacity: ${(props) => (props.$initializing ? 0 : 1)};

  @media (min-width: 768px) {
  }
`;

export const Nav = styled.nav`
  display: flex;
  justify-content: space-between;
  align-items: center;

  h1 {
    flex: 2;
  }

  > div,
  > button {
    flex: 1;
    justify-self: flex-end;
  }
`;

export const InnerWrapper = styled.div`
  @media (min-width: 768px) {
    display: flex;
    gap: 30px;
    flex-wrap: wrap;
    justify-content: center;
  }
`;

export const ScreenWrapper = styled.div`
  display: contents;
  @media (max-width: 768px) {
    min-height: calc(100vh - 40px);
    align-items: center;
    justify-content: flex-end;
    flex-direction: column;
    display: flex;
  }
`;

export const Board = styled.div`
  transition: all 0.2s ease-in-out;
  position: relative;
  filter: ${(props) => (props.$loading ? "blur(5px)" : "none")};
`;

export const Row = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
`;

export const Letter = styled(Row)`
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

  box-shadow: ${(props) =>
    props.$focus ? "0 0 3px 3px var(--focus-color)" : "none"};
`;

export const Inner = styled(motion.div)`
  position: relative;

  text-align: center;
  transform-style: preserve-3d;
`;
