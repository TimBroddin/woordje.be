import woorden from "../../data/woorden.json";
import { getGameId } from "../../lib/gameId";

export default function handler(req, res) {
  const GAME_ID = getGameId();
  res
    .status(200)
    .json([3, 4, 5, 6, 7, 8, 9].map((idx) => woorden[idx][GAME_ID]));
}
