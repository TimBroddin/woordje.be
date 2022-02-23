import { gql } from "apollo-server-micro";

export const RANDOM_WORD_QUERY = gql`
  query randomWords($amount: Int, $wordLength: Int) {
    randomWords(amount: $amount, wordLength: $wordLength)
  }
`;

export const SOLUTION_QUERY = gql`
  query solution($gameId: Int, $wordLength: Int = 6, $customGame: String) {
    solution(
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

export const LOG_RESULT_MUTATION = gql`
  mutation logResult(
    $gameId: Int!
    $customGame: String
    $wordLength: Int!
    $tries: Int!
  ) {
    logResult(
      gameId: $gameId
      customGame: $customGame
      wordLength: $wordLength
      tries: $tries
    )
  }
`;
