const customGameResolver = (gameType, wordLength) => {
  if (gameType === "vrttaal") {
    return 999;
  } else {
    return wordLength;
  }
};

export { customGameResolver };
