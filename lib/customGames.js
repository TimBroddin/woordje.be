const customGameResolver = (gameType, WORD_LENGTH) => {
  if (gameType === "vrttaal") {
    return 999;
  } else {
    return WORD_LENGTH;
  }
};

export { customGameResolver };
