const gql = (query) => query.join("");

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
    $gameType: String!
    $wordLength: Int!
    $tries: Int!
  ) {
    logResult(
      gameId: $gameId
      gameType: $gameType
      wordLength: $wordLength
      tries: $tries
    )
  }
`;

export const STATS_QUERY = gql`
  query stats($gameId: Int!, $wordLength: Int!, $gameType: String!) {
    stats(gameId: $gameId, wordLength: $wordLength, gameType: $gameType) {
      wins
      distribution {
        tries
        amount
      }
    }
  }
`;
