import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import styled from "styled-components";
import { useGameState } from "../lib/hooks";
import { usePlausible } from "next-plausible";
import { useSelector, useDispatch } from "react-redux";
import { setColorBlind } from "../redux/features/settings";
import { getRandomWord } from "../redux/features/randomWord";
import { show as showSplash } from "../redux/features/splash";
import { Button, ButtonRow } from "./styled";

const FooterWrapper = styled.footer`
  color: var(--text-primary);
  font-size: 14px;
  text-align: center;
  padding: 3px 0;

  @media (max-width: 768px) {
    margin: 0 20px;
  }

  h1 {
    font-size: 16px;
    font-weight: bold;
    text-transform: uppercase;
    color: var(--text-tertiary);
    margin-bottom: 2px;
    margin-top: 0px;
  }

  span {
    color: var(--text-tertiary);
  }

  a {
    text-decoration: underline;
    font-weight: bold;
  }

  p {
    margin-top: 0;
  }

  @media (min-width: 768px) {
    text-align: left;
    max-width: 300px;
  }
`;

const Random = styled.div`
  cursor: pointer;
  font-size: 16px;
  padding: 5px;
  margin-top: 5px;
  display: inline-block;
  font-family: Courier;
`;

const Levels = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
  justify-content: center;

  @media (min-width: 768px) {
    justify-content: flex-start;
  }
`;

const Level = styled.a`
  padding: 10px;
  border: 1px solid var(--color-button);
  font-size: 16px;
  background-color: ${(props) =>
    props.$current ? "var(--color-button-enabled)" : "var(--color-button)"};
  color: white;
  text-decoration: none !important;
  margin-bottom: 10px;
`;

const Footer = () => {
  const dispatch = useDispatch();
  const router = useRouter();

  const randomWord = useSelector((state) => state.randomWord);
  const colorBlind = useSelector((state) => state.settings?.colorBlind);
  const { WORD_LENGTH, BOARD_SIZE } = useSelector((state) => state.settings);
  const [_, setGameState] = useGameState();
  const plausible = usePlausible();

  return (
    <FooterWrapper>
      <h1>Help</h1>
      <p>
        Raad het {WORD_LENGTH}-letterwoord in {BOARD_SIZE} beurten, of minder.
      </p>

      <ButtonRow>
        <Button
          href="#help"
          onClick={(e) => {
            e.preventDefault();
            dispatch(showSplash());
          }}>
          💁🏼 Extra uitleg
        </Button>

        <Button
          href="#highcontrast"
          onClick={(e) => {
            e.preventDefault();
            dispatch(setColorBlind(!colorBlind));
          }}
          style={{
            backgroundColor: colorBlind
              ? "var(--color-button-enabled)"
              : "var(--color-button)",
          }}>
          <span>{colorBlind ? "☑️" : "🎨"}</span> Hoog contrast
        </Button>
      </ButtonRow>

      <p>Elke dag een nieuwe opgave!</p>
      <h1>Aantal letters</h1>
      <Levels>
        {[3, 4, 5, 6, 7, 8, 9, 10].map((level) => (
          <Link href={`/speel/${level}`} key={`level-${level}`} passHref>
            <Level $current={WORD_LENGTH === level}>{level}</Level>
          </Link>
        ))}
      </Levels>

      <h1>Willekeurig woord</h1>
      <p>
        <Random onClick={(e) => dispatch(getRandomWord())}>
          {randomWord.value
            ? randomWord.value
            : new Array(WORD_LENGTH).fill("a")}
        </Random>
      </p>

      <h1>Over</h1>
      <p>
        Deze Vlaamse versie van Wordle werd gemaakt door{" "}
        <a href="https://www.scam.city/" rel="noreferrer" target="_blank">
          ScamCity
        </a>
        /
        <a href="https://broddin.be/" rel="noreferrer" target="_blank">
          Tim&nbsp;Broddin
        </a>
        .
      </p>
      <p>
        Gebaseerd op{" "}
        <a
          href="https://www.powerlanguage.co.uk/wordle/"
          rel="noreferrer"
          target="_blank">
          Wordle
        </a>{" "}
        en{" "}
        <a
          href="https://github.com/rauchg/wordledge"
          rel="noreferrer"
          target="_blank">
          Wordledge
        </a>
        .
      </p>
    </FooterWrapper>
  );
};

export default Footer;
