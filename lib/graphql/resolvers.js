import { UserInputError } from "apollo-server-core";
import { getSolution, getRandomWords, check } from "@/lib/server";

export const resolvers = {
  Query: {
    getSolution: async (parent, args, context, info) => {
      const { customGame, gameId, wordLength } = args;
      return await getSolution(gameId, wordLength, customGame);
    },
    getRandomWords: async (parent, args, context, info) => {
      const { amount, wordLength } = args;
      if (amount > 30) {
        throw new UserInputError("Amount is too high", {
          argumentName: "amount",
        });
      }

      if (wordLength < 3 || wordLength > 10) {
        throw new UserInputError("Invalid value", {
          argumentName: "wordLength",
        });
      }

      return getRandomWords(amount, wordLength);
    },
    check: async (parent, args, context, info) => {
      const { text, customGame, gameId, wordLength } = args;
      try {
        return await check(text, gameId, wordLength, customGame);
      } catch (e) {
        throw new UserInputError("unknown word", {
          argumentName: "text",
        });
      }
    },
  },
};
