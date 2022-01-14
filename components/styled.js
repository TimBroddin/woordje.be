import styled from "styled-components";

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
  width: 55px;
  height: 53px;
  background-color: #ccc;
  font-size: 34px;
  font-weight: bold;
  text-transform: uppercase;
  margin: 3px;
  color: #000;

  background-color: ${(props) =>
    props.$disabled
      ? "#666"
      : props.$score === "bad"
      ? "#ccc"
      : props.$score === "good"
      ? "#0f0"
      : props.$score === "off"
      ? "yellow"
      : "#CCC"};

  box-shadow: ${(props) => (props.$focus ? "0 0 3px 3px cyan" : "none")};
`;
