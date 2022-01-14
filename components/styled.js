import styled from "styled-components";

export const Main = styled.main`
  color: #fff;
  width: 100vw;
  height: 100vh;
  height: -webkit-fill-available;
  user-select: none;
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

export const Footer = styled.footer`
  color: #999;
  font-size: 13px;
  text-align: center;
  padding: 3px 0;

  h1 {
    font-size: 16px;
    font-weight: bold;
    text-transform: uppercase;
    color: #666;
    margin-bottom: 2px;
  }

  span {
    color: #666;
  }

  a {
    text-decoration: underline;
  }

  p {
    margin-top: 0;
  }

  @media (min-width: 768px) {
    text-align: left;
    max-width: 300px;
  }
`;

export const Random = styled.span`
  cursor: pointer;
  text-decoration: dotted underline;
  color: white;
`;
export const HiddenInput = styled.input`
  background: #fff;
  color: #000;
  position: absolute;
  left: -100000px;
  font-size: 16px;
`;
