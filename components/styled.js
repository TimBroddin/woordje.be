import styled from "styled-components";
import { motion } from "framer-motion";

export const Main = styled.main`
  color: #fff;
  width: 100vw;
  height: 100vh;
  height: -webkit-fill-available;
  transition: all 0.2s ease-in-out;
  opacity: ${(props) => (props.$initializing ? 0 : 1)};

  @media (min-width: 768px) {
    height: 100vh;

    display: flex;
    justify-content: center;
    align-items: center;
    gap: 30px;
    flex-wrap: wrap;
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

export const ModalWrapper = styled.div`
  position: absolute;
  top: 0;
  height: 100%;
  margin: auto;
  width: 100vw;
  display: flex;
  align-items: center;
  justify-content: center;
`;

export const Summary = styled.div`
  position: relative;
  width: 90vw;

  @media (min-width: 768px) {
    width: 320px;
  }

  h1 {
    font-size: 16px;
    margin-top: 10px;
    margin-bottom: 10px;
    text-align: center;
    line-height: 1.4;
    small {
      font-size: 9px;
    }
  }

  h2 {
    text-transform: uppercase;
    font-size: 14px;
  }

  .button {
    flex: 1;
  }

  button,
  a.share {
    padding: 5px;
    background: #fff;
    color: white;
    border: 1px solid #000;
    cursor: pointer;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    font-weight: bold;
    text-transform: uppercase;
    background: #2980b9;
    margin-bottom: 5px;
    border-radius: 5px;
    font-size: 13px;
    text-decoration: none;
    flex: 1;
    flex-grow: 1;
  }

  a {
    text-decoration: underline;
  }
`;

export const Inner = styled(motion.div)`
  position: relative;

  text-align: center;
  transform-style: preserve-3d;
`;

export const Face = styled.div`
  background: var(--modal-background);
  text-align: center;
  padding: 25px 15px;
  font-size: 12px;
  color: var(--text-primary);
  border-radius: 15px;
  box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.5);

  position: relative;

  top: 0;
  backface-visibility: hidden;
`;

export const CloseModal = styled.a`
  position: absolute;
  right: 10px;
  top: 10px;
  display: inline-flex;
  border-radius: 50%;
  background-color: var(--text-primary);
  color: var(--text-primary-inverse);
  width: 20px;
  height: 20px;
  align-items: center;
  justify-content: center;
  text-decoration: none !important;
  font-weight: bold;
`;
