import React, { useState, useContext } from "react";

const GameContext = React.createContext([false, () => {}]);

const GameContextProvider = (props) => {
  const [settings, setSettings] = useState({ WORD_SIZE: 6, BOARD_SIZE: 7 });
  const [gameState, setGameState] = useState(null);

  return (
    <GameContext.Provider
      value={[settings, setSettings, gameState, setGameState]}>
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

export { GameContext, GameContextProvider, useGameSettings, useGameState };
