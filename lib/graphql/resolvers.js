import { UserInputError } from "apollo-server-core";
import { getSolution, getRandomWords, check } from "@/lib/server";
import { getGraphQLRateLimiter } from "graphql-rate-limit";


const rateLimiter = getGraphQLRateLimiter({
  identifyContext: (ctx) => {
    console.log(`ip: ${ctx.ip}`);
    return ctx.ip;
  },
});

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
        const result = await check(text, gameId, wordLength, customGame);
        return result;
      } catch (e) {
        throw new UserInputError("unknown word", {
          argumentName: "text",
        });
      }
    },
    stats: async (parent, args, context, info) => {
      const { gameId, wordLength, gameType } = args;
      const { supabaseClient, cache } = context;

      const { data: statsRow } = await supabaseClient
          .from('stats')
          .select('*')
          .eq('gameId', gameId)
          .eq('wordLength', wordLength)
          .eq('gameType', gameType)
          .single();

      const wins = statsRow
        ? Math.round((statsRow.wins / statsRow.total) * 100)
        : 0;

      const total = statsRow ? statsRow.total : 0;

      const { data: statsDistribution } = await supabaseClient
          .from('StatsDistribution')
          .select('*')
          .eq('gameId', gameId)
          .eq('wordLength', wordLength)
          .eq('gameType', gameType);

      const distribution = statsDistribution.map((row) => ({
        tries: row.tries,
        amount: total ? Math.round((row.amount / total) * 100) : 0,
      }));

      return { wins, distribution };
    },
  },
  Mutation: {
    logResult: async (parent, args, context, info) => {
      const errorMessage = await rateLimiter(
        { parent, args, context, info },
        { max: 10, window: "1m" }
      );
      if (errorMessage) throw new Error(errorMessage);

      const { gameId, wordLength, gameType, tries } = args;
      const { supabaseClient } = context;

      const won = tries <= wordLength + 1;

      // Update stats table
      const { data: existingStats, error: selectStatsError } = await supabaseClient
          .from('stats')
          .select('wins, total')
          .eq('gameId', gameId)
          .eq('wordLength', wordLength)
          .eq('gameType', gameType)
          .single();

      if (selectStatsError && selectStatsError.code !== 'PGRST116') {
        console.error('Error selecting stats:', selectStatsError);
        // Handle the error appropriately
      } else {
        let updateStatsData;
        let updateStatsError;

        if (!existingStats) {
          // Create a new row if it doesn't exist
          ({ data: updateStatsData, error: updateStatsError } = await supabaseClient
              .from('stats')
              .insert({
                gameId,
                wordLength,
                gameType,
                wins: won ? 1 : 0,
                total: 1,
              }));
        } else {
          // Update the existing row
          ({ data: updateStatsData, error: updateStatsError } = await supabaseClient
              .from('stats')
              .update({
                wins: existingStats.wins + (won ? 1 : 0),
                total: existingStats.total + 1,
              })
              .eq('gameId', gameId)
              .eq('wordLength', wordLength)
              .eq('gameType', gameType));
        }

        if (updateStatsError) {
          console.error('Error updating stats:', updateStatsError);
          // Handle the error appropriately
        } else {
          console.log('Stats updated successfully');
        }
      }

// Update statsDistribution table
      const { data: existingStatsDistribution, error: selectStatsDistributionError } = await supabaseClient
          .from('StatsDistribution')
          .select('amount')
          .eq('gameId', gameId)
          .eq('wordLength', wordLength)
          .eq('gameType', gameType)
          .eq('tries', tries)
          .single();

      if (selectStatsDistributionError && selectStatsDistributionError.code !== 'PGRST116') {
        console.error('Error selecting stats distribution:', selectStatsDistributionError);
        // Handle the error appropriately
      } else {
        let updateStatsDistributionData;
        let updateStatsDistributionError;

        if (!existingStatsDistribution) {
          // Create a new row if it doesn't exist
          ({ data: updateStatsDistributionData, error: updateStatsDistributionError } = await supabaseClient
              .from('StatsDistribution')
              .insert({
                gameId,
                wordLength,
                gameType,
                tries,
                amount: 1,
              }));
        } else {
          // Update the existing row
          ({ data: updateStatsDistributionData, error: updateStatsDistributionError } = await supabaseClient
              .from('StatsDistribution')
              .update({
                amount: existingStatsDistribution.amount + 1,
              })
              .eq('gameId', gameId)
              .eq('wordLength', wordLength)
              .eq('gameType', gameType)
              .eq('tries', tries));
        }

        if (updateStatsDistributionError) {
          console.error('Error updating stats distribution:', updateStatsDistributionError);
          // Handle the error appropriately
        } else {
          console.log('Stats distribution updated successfully');
        }
      }

      return true;
    },
  },
};
