import { useState, useEffect } from "react";
import Link from "next/link";
import styled from "styled-components";

async function getRandomword(length) {
  const res = await fetch(`/api/random?l=${length}`);
  return await res.json();
}

const FooterWrapper = styled.footer`
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

const Random = styled.span`
  cursor: pointer;
  text-decoration: dotted underline;
  color: white;
`;

const Footer = ({ WORD_LENGTH, BOARD_SIZE }) => {
  const [randomWord, setRandomWord] = useState(null);

  useEffect(() => {
    getRandomword(WORD_LENGTH).then((word) => setRandomWord(word));
  }, [WORD_LENGTH]);

  return (
    <FooterWrapper>
      <h1>Help</h1>
      <p>
        Raad het {WORD_LENGTH}-letterwoord in {BOARD_SIZE} beurten, of minder.
      </p>
      <p>
        Op desktop kan je gewoon beginnen typen, enter om je woord in te dienen.
        Op mobiel moet je eerst de vakjes aanraken.
      </p>
      <p>
        🟩 = letter staat op de juiste plek
        <br />
        🟨 = letter komt voor in het woord, maar niet op de juiste plek.{" "}
      </p>

      <p>Elke dag een nieuwe opgave!</p>

      <h1>Hulplijn</h1>
      <p>
        Hier is een willekeurig woord met {WORD_LENGTH} letters:{" "}
        <Random
          onClick={(e) =>
            getRandomword(WORD_LENGTH).then((word) =>
              setRandomWord(JSON.parse(word))
            )
          }>
          {randomWord}
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

      <h1>
        Cr
        <span onDoubleClick={() => setGameState({ state: [], initial: true })}>
          e
        </span>
        dits
      </h1>
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
