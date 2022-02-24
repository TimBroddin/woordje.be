import { gql } from "apollo-server-micro";

export const typeDefs = gql`
  enum CacheControlScope {
    PUBLIC
    PRIVATE
  }

  directive @cacheControl(
    maxAge: Int
    scope: CacheControlScope
    inheritMaxAge: Boolean
  ) on FIELD_DEFINITION | OBJECT | INTERFACE | UNION

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
    amount: Float!
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

    stats(gameId: Int!, wordLength: Int!, gameType: String!): Stats
  }

  type Mutation {
    logResult(
      gameId: Int!
      wordLength: Int!
      gameType: String!

      tries: Int!
    ): Boolean
  }
`;
