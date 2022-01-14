import React, { useState, useContext } from "react";

const GameContext = React.createContext([false, () => {}]);

const GameContextProvider = (props) => {
  const [settings, setSettings] = useState({ WORD_SIZE: 6, BOARD_SIZE: 7 });
  return (
    <GameContext.Provider value={[settings, setSettings]}>
      {props.children}
    </GameContext.Provider>
  );
};

const useGameSettings = () => {
  const [settings, setSettings] = useContext(GameContext);

  return [settings, setSettings];
};

export { GameContext, GameContextProvider, useGameSettings };
