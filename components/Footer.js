import { useState, useEffect } from "react";
import Link from "next/link";
import styled from "styled-components";
import { useGameState } from "../lib/hooks";
import { usePlausible } from "next-plausible";
import { useSelector, useDispatch } from "react-redux";
import { setColorBlind } from "../redux/features/settings";
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
        <br />
        🎨{" "}
        {colorBlind ? (
          <a
            href="#defaultcolor"
            onClick={(e) => {
              e.preventDefault();
              dispatch(setColorBlind(false));
            }}>
            Standaard kleuren
          </a>
        ) : (
          <a
            href="#highcontrast"
            onClick={(e) => {
              e.preventDefault();
              dispatch(setColorBlind(true));
            }}>
            Hoog contrast kleuren
          </a>
        )}
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

      <h1>Over</h1>
      <p>
        Deze Vlaamse versie van Wordle werd tussen de 🥣 en de 🥔 gemaakt door{" "}
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
      <p>
        Reddit community:{" "}
        <a
          href="https://www.reddit.com/r/woordje/"
          rel="noreferrer"
          onClick={(e) =>
            plausible("Link", {
              props: { to: "reddit", location: "home" },
            })
          }
          target="_blank">
          /r/woordje
        </a>
      </p>
    </FooterWrapper>
  );
};

export default Footer;
