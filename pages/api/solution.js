import woorden from "../../data/woorden.json";
import { getGameId } from "../../lib/gameId";
import { getCurrentWordFromAirTable } from "../../lib/airtable";

export default async function handler(req, res) {
  const GAME_ID = getGameId();
  const l = req.query.l;

  if (l === "vrttaal") {
    const { Woord, Uitleg } = await getCurrentWordFromAirTable();
    res.status(200).json({ word: Woord.toLowerCase(), meaning: Uitleg });
  } else {
    res.status(200).json({ word: woorden[parseInt(l)][GAME_ID] });
  }
}
