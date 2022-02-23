import { gql } from "apollo-server-micro";

export const typeDefs = gql`
  type CheckResult {
    letter: String!
    score: String!
  }

  type Solution {
    word: String!
    meaning: String
  }

  type Distribution {
    tries: Int!
    wins: Float!
  }

  type Stats {
    wins: Float!
    distribution: [Distribution]
  }

  type Query {
    solution(gameId: Int, wordLength: Int = 6, customGame: String): Solution

    randomWords(amount: Int = 3, wordLength: Int = 6): [String]

    check(
      text: String
      customGame: String
      gameId: Int
      wordLength: Int
    ): [CheckResult]

    stats(gameId: Int!, wordLength: Int!, customGame: String): Stats
  }

  type Mutation {
    logResult(
      gameId: Int!
      customGame: String
      wordLength: Int!
      tries: Int!
    ): Boolean
  }
`;
