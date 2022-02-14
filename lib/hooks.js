import React, { useEffect, useState, useCallback, useContext } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useRouter } from "next/router";

import { getGameId } from "./gameId";
import { customGameResolver } from "./customGames";
import { resetGameState, setGameState } from "../redux/features/gameState";

const useGameState = () => {
  const dispatch = useDispatch();

  const { WORD_LENGTH, gameType } = useSelector((state) => state.settings);
  const gameId = getGameId();

  const currentGameState = useSelector((state) => state.gameState);
  if (currentGameState.gameId !== getGameId()) {
    dispatch(resetGameState(getGameId()));
  }

  const guesses = useSelector((state) => {
    return state.gameState.guesses[
      customGameResolver(state.settings.gameType, WORD_LENGTH)
    ];
  });

  const setGameStateAction = (gameState) => {
    dispatch(
      setGameState({
        gameId,
        WORD_LENGTH,
        gameType,
        guesses: gameState.guesses,
      })
    );
  };
  return [guesses ? { guesses } : { guesses: [] }, setGameStateAction];
};

const useBrand = () => {
  const { locale } = useRouter();

  switch (locale) {
    case "nl-BE":
      return {
        id: "woordje",
        title: "Woordje",
        url: "https://www.woordje.be",
        description:
          "Een dagelijks woordspelletje gebaseerd op Wordle. De Vlaamse Wordle, voor België en Nederland, met 3 tot 10 letters.",
        manifest: "manifest_be.json",
        share_html: '<a href="https://woordje.be">woordje.be</a>',
        share_text: "woordje.be",
        share_hashtag: "#woordje",
      };
      break;
    case "nl-NL":
      return {
        id: "woordol",
        title: "Woordol",
        url: "https://www.woordol.nl",
        description:
          "Een dagelijks woordspelletje gebaseerd op Wordle. De Nederlandse Wordle, met 3 tot 10 letters.",
        manifest: "manifest_nl.json",
        share_html: '<a href="https://woordol.nl">Woordol.nl</a>',
        share_text: "woordol.nl",
        share_hashtag: "#woordol",
      };
  }
};

const useCorrectedGameId = () => {
  const brand = useBrand();
  if (brand.id === "woordje") {
    return getGameId() - 1;
  } else if (brand.id === "woordol") {
    return getGameId() - 36;
  }
};

export { useGameState, useBrand, useCorrectedGameId };
