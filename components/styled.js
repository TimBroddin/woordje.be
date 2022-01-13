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
  width: 300px;
  background: rgba(0, 0, 0, 0.7);
  text-align: center;
  padding: 15px;
  font-size: 12px;
  color: white;

  h1 {
    font-size: 16px;
    margin-top: 0;
    margin-bottom: 20px;
  }

  h2 {
    text-transform: uppercase;
    font-size: 14px;
  }

  button,
  a.share {
    padding: 5px;
    background: #fff;
    color: #000;
    border: 1px solid #000;
    cursor: pointer;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    font-weight: bold;
    text-transform: uppercase;
    background: cyan;
    margin-bottom: 5px;
    border-radius: 5px;
    font-size: 14px;
    text-decoration: none;
  }

  a {
    text-decoration: underline;
  }
`;

export const ShareText = styled.div`
  margin-bottom: 20px;
  font-size: 14px;
  background: #fff;
  color: #000;
  user-select: all;
  padding: 10px;
  white-space: pre-wrap;
  line-height: 14px;
  border: 3px solid #000;
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

export const CloseModal = styled.a`
  display: inline-flex;
  float: right;
  border-radius: 50%;
  background-color: white;
  color: black;
  width: 20px;
  height: 20px;
  align-items: center;
  justify-content: center;
  text-decoration: none;
  font-weight: bold;
`;
