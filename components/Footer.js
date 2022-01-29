import { useState, useEffect } from "react";
import Link from "next/link";
import styled from "styled-components";
import { useGameState } from "../lib/hooks";
import { useSelector, useDispatch } from "react-redux";
import { getRandomWord } from "../redux/features/randomWord";
import { show as showSplash } from "../redux/features/splash";

const FooterWrapper = styled.footer`
  color: var(--text-secondary);
  font-size: 13px;
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
    color: var(--text-tertiary);
  }

  p {
    margin-top: 0;
  }

  @media (min-width: 768px) {
    text-align: left;
    max-width: 300px;
  }
`;

const Random = styled.span`
  cursor: pointer;
  text-decoration: dotted underline;
  color: white;
`;

const Footer = () => {
  const dispatch = useDispatch();

  const randomWord = useSelector((state) => state.randomWord);
  const { WORD_LENGTH, BOARD_SIZE } = useSelector((state) => state.settings);
  const [_, setGameState] = useGameState();

  return (
    <FooterWrapper>
      <h1>Help</h1>
      <p>
        Raad het {WORD_LENGTH}-letterwoord in {BOARD_SIZE} beurten, of minder.
      </p>

      <p>
        💁🏼{" "}
        <a
          href="#help"
          onClick={(e) => {
            e.preventDefault();
            dispatch(showSplash());
          }}>
          Extra uitleg
        </a>
      </p>

      <p>Elke dag een nieuwe opgave!</p>

      <h1>Hulplijn</h1>
      <p>
        Hier is een willekeurig woord met {WORD_LENGTH} letters:{" "}
        <Random onClick={(e) => dispatch(getRandomWord())}>
          {randomWord.value}
        </Random>
      </p>
      <h1>Te moeilijk/makkelijk?</h1>
      <p>
        Probeer ook eens met{" "}
        {[3, 4, 5, 6, 7, 8]
          .filter((x) => x !== WORD_LENGTH)
          .map((x, i) => (
            <span key={`link-${x}`}>
              <Link href={`/speel/${x}`}>
                <a>{x}</a>
              </Link>
              {i < 3 ? ", " : i < 4 ? " of " : ""}
            </span>
          ))}{" "}
        letters
      </p>

      <h1>Credits</h1>
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
        . Tussen de 🥣 en de 🥔 gemaakt door{" "}
        <a href="https://broddin.be/" rel="noreferrer" target="_blank">
          Tim Broddin
        </a>
      </p>
    </FooterWrapper>
  );
};

export default Footer;
