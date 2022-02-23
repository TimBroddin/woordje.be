import { gql } from "apollo-server-micro";

export const RANDOM_WORD_QUERY = gql`
  query getRandomWords($amount: Int, $wordLength: Int) {
    getRandomWords(amount: $amount, wordLength: $wordLength)
  }
`;

export const SOLUTION_QUERY = gql`
  query getSolution($gameId: Int, $wordLength: Int = 6, $customGame: String) {
    getSolution(
      gameId: $gameId
      wordLength: $wordLength
      customGame: $customGame
    ) {
      word
      meaning
    }
  }
`;

export const CHECK_QUERY = gql`
  query check(
    $text: String
    $gameId: Int
    $wordLength: Int
    $customGame: String
  ) {
    check(
      text: $text
      gameId: $gameId
      wordLength: $wordLength
      customGame: $customGame
    ) {
      letter
      score
    }
  }
`;
