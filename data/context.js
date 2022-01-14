import React, { useEffect, useState, useCallback, useContext } from "react";

const GameContext = React.createContext([false, () => {}]);

const GameContextProvider = (props) => {
  const [settings, setSettings] = useState({ WORD_SIZE: 6, BOARD_SIZE: 7 });
  const [gameState, setGameState] = useState(null);
  const [randomWord, setRandomWord] = useState(null);

  return (
    <GameContext.Provider
      value={[
        settings,
        setSettings,
        gameState,
        setGameState,
        randomWord,
        setRandomWord,
      ]}>
      {props.children}
    </GameContext.Provider>
  );
};

const useGameSettings = () => {
  const [settings, setSettings] = useContext(GameContext);

  return [settings, setSettings];
};

const useGameState = () => {
  const [_, __, gameState, setGameState] = useContext(GameContext);
  return [gameState, setGameState];
};

const useRandomWord = () => {
  const [settings, __, ___, ____, randomWord, setRandomWord] =
    useContext(GameContext);
  const { WORD_LENGTH } = settings;

  const fetchRandom = useCallback(() => {
    if (!WORD_LENGTH) return;
    return fetch(`/api/random?l=${WORD_LENGTH}`)
      .then((res) => res.json())
      .then((word) => setRandomWord(word));
  }, [WORD_LENGTH, setRandomWord]);

  useEffect(() => {
    fetchRandom();
  }, [fetchRandom]);

  return [randomWord, fetchRandom];
};

export {
  GameContext,
  GameContextProvider,
  useGameSettings,
  useGameState,
  useRandomWord,
};
