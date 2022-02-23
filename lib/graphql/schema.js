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

  type Query {
    getSolution(gameId: Int, wordLength: Int = 6, customGame: String): Solution

    getRandomWords(amount: Int = 3, wordLength: Int = 6): [String]

    check(
      text: String
      customGame: String
      gameId: Int
      wordLength: Int
      locale: String = "nl-BE"
    ): [CheckResult]
  }
`;
