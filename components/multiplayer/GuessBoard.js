"use client";

import { useEffect, useRef } from "react";
import { Board, Row } from "@/components/styled";
import Letter from "@/components/Letter";

const STAGGER = 0.15;
const rowVariants = { hidden: {}, show: { transition: { staggerChildren: STAGGER } } };

const corner = (rowIndex, totalRows, letterIndex, totalLetters) => {
  const r = "7px";
  const top = rowIndex === 0;
  const bottom = rowIndex === totalRows - 1;
  const left = letterIndex === 0;
  const right = letterIndex === totalLetters - 1;
  if (top && left) return { borderTopLeftRadius: r };
  if (top && right) return { borderTopRightRadius: r };
  if (bottom && left) return { borderBottomLeftRadius: r };
  if (bottom && right) return { borderBottomRightRadius: r };
};

/** The player's own board: scored rows, the input row, then empty rows. */
export default function GuessBoard({ guesses, wordLength, maxGuesses, inputText, active, loading }) {
  const inputRowRef = useRef(null);
  const rows = [];

  // On very small screens the board area scrolls; keep the row you type in visible
  useEffect(() => {
    inputRowRef.current?.scrollIntoView({ block: "nearest" });
  }, [guesses.length]);

  guesses.forEach((match, i) => {
    rows.push(
      <Row
        key={`g${i}`}
        variants={rowVariants}
        initial={i === guesses.length - 1 ? "hidden" : "show"}
        animate="show"
      >
        {match.map((item, k) => (
          <Letter key={k} radius={corner(i, maxGuesses, k, wordLength)} score={item.score}>
            {item.letter}
          </Letter>
        ))}
      </Row>
    );
  });

  for (let idx = guesses.length; idx < maxGuesses; idx++) {
    const isInput = idx === guesses.length && active;
    rows.push(
      <Row key={`e${idx}`} ref={isInput ? inputRowRef : undefined}>
        {Array.from({ length: wordLength }, (_, k) =>
          isInput ? (
            <Letter
              key={k}
              focus={k === Math.min(inputText.length, wordLength - 1)}
              radius={corner(idx, maxGuesses, k, wordLength)}
            >
              {inputText[k] ?? null}
            </Letter>
          ) : (
            <Letter key={k} disabled radius={corner(idx, maxGuesses, k, wordLength)} />
          )
        )}
      </Row>
    );
  }

  return (
    // Tile size comes from .mp-board in globals.css: it fits the board into
    // the height its .mp-board-area parent has left.
    <Board
      loading={loading}
      className="mp-board"
      style={{ "--word-length": wordLength, "--shrink-size": "6px", "--rows": maxGuesses, "--cols": wordLength }}
    >
      {rows}
    </Board>
  );
}
