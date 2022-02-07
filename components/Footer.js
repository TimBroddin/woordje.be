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
  color: var(--text-secondary);
  font-size: 14px;
  text-align: center;
  padding: 3px 0;

  h1 {
    font-size: 16px;
    font-weight: bold;
    text-transform: uppercase;
    color: var(--text-tertiary);
    margin-bottom: 2px;
  }

  span {
    color: var(--text-tertiary);
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

const Random = styled.div`
  cursor: pointer;
  text-decoration: dotted underline;
  color: var(--text-primary-inverse) !important;
  background-color: var(--text-primary);
  padding: 5px;
  margin-top: 5px;
  font-size: 20px;
  display: inline-block;
  font-family: Courier;
`;

const Levels = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
`;

const Level = styled.a`
  padding: 10px;
  border: 1px solid var(--color-button);
  font-size: 16px;
  background-color: ${(props) =>
    props.$current ? "var(--color-button-enabled)" : "var(--color-button)"};
  color: var(--text-primary-inverse);
  text-decoration: none !important;
`;

const Footer = () => {
  const dispatch = useDispatch();
  const router = useRouter();

  const randomWord = useSelector((state) => state.randomWord);
  const colorBlind = useSelector((state) => state.settings?.colorBlind);
  const { WORD_LENGTH, BOARD_SIZE } = useSelector((state) => state.settings);
  const [_, setGameState] = useGameState();
  const plausible = usePlausible();

  const seoWord = ["Vlaamse", "nederlandstalige", "Belgische"][
    Math.floor(Math.random() * 3)
  ];

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

      <h1>Willekeurig woord</h1>
      <p>
        <Random onClick={(e) => dispatch(getRandomWord())}>
          {randomWord.value
            ? randomWord.value
            : new Array(WORD_LENGTH).fill("a")}
        </Random>
      </p>
      <h1>Aantal letters</h1>
      <Levels>
        {[3, 4, 5, 6, 7, 8, 9, 10].map((level) => (
          <Link href={`/speel/${level}`} key={`level-${level}`} passHref>
            <Level $current={WORD_LENGTH === level}>{level}</Level>
          </Link>
        ))}
      </Levels>

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
