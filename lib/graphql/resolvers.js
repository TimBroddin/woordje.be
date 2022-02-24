import { UserInputError } from "apollo-server-core";
import { getSolution, getRandomWords, check } from "@/lib/server";

export const resolvers = {
  Query: {
    solution: async (parent, args, context, info) => {
      const { customGame, gameId, wordLength } = args;
      return await getSolution(gameId, wordLength, customGame);
    },
    randomWords: async (parent, args, context, info) => {
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
    stats: async (parent, args, context, info) => {
      const { gameId, wordLength, gameType } = args;
      const { prisma, cache } = context;

      const statsRow = await prisma.stats.findUnique({
        where: {
          gameId_wordLength_gameType: {
            gameId,
            wordLength,
            gameType,
          },
        },
      });

      const wins = statsRow
        ? ((statsRow.wins / statsRow.total) * 100).toFixed(2)
        : 0;

      const total = statsRow ? statsRow.total : 0;

      const statsDistribution = await prisma.statsDistribution.findMany({
        where: {
          gameId,
          wordLength,
          gameType,
        },
      });

      const distribution = statsDistribution.map((row) => ({
        tries: row.tries,
        amount: total ? Math.round((row.amount / total) * 100) : 0,
      }));

      return { wins, distribution };
    },
  },
  Mutation: {
    logResult: async (parent, args, context, info) => {
      const { gameId, wordLength, gameType, tries } = args;
      const { prisma } = context;

      const won = tries <= wordLength + 1;

      await prisma.stats.upsert({
        where: {
          gameId_wordLength_gameType: {
            gameId,
            wordLength,
            gameType,
          },
        },
        create: {
          gameId,
          wordLength,
          gameType,
          wins: won ? 1 : 0,
          total: 1,
        },
        update: {
          gameId,
          wordLength,
          gameType,
          wins: {
            increment: won ? 1 : 0,
          },
          total: {
            increment: 1,
          },
        },
      });

      await prisma.statsDistribution.upsert({
        where: {
          gameId_wordLength_gameType_tries: {
            gameId,
            wordLength,
            gameType,
            tries,
          },
        },
        create: {
          gameId,
          wordLength,
          gameType,
          tries,
          amount: 1,
        },
        update: {
          gameId,
          wordLength,
          gameType,
          tries,
          amount: {
            increment: 1,
          },
        },
      });

      return true;
    },
  },
};
