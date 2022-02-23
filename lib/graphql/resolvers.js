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
      const { gameId, wordLength, customGame } = args;
      const { prisma } = context;

      const result = await prisma.stats.groupBy({
        by: ["won"],
        where: {
          gameId,
          wordLength,
          customGame,
        },
        _count: {
          won: true,
        },
      });

      const totalRows = result
        .map((row) => row._count.won)
        .reduce((a, b) => a + b, 0);
      const won = result
        .filter((row) => row.won)
        .map((row) => row._count.won)
        .reduce((a, b) => a + b, 0);

      const distribution = await prisma.stats.groupBy({
        by: ["tries"],
        where: {
          gameId,
          wordLength,
          customGame,
          won: true,
        },
        _count: {
          _all: true,
        },
        orderBy: {
          tries: "asc",
        },
      });

      return {
        wins: Math.round((won / totalRows) * 100),
        distribution: distribution.map((x) => ({
          tries: x.tries,
          wins: Math.round((x._count._all / won) * 100),
        })),
      };
    },
  },
  Mutation: {
    logResult: async (parent, args, context, info) => {
      const { gameId, customGame, wordLength, won, tries } = args;
      const { prisma } = context;
      await prisma.stats.create({
        data: {
          gameId,
          customGame,
          wordLength,
          won: tries <= wordLength,
          tries,
        },
      });

      return true;
    },
  },
};
