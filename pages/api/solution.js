import woorden from "../../data/woorden.json";
import { getGameId } from "../../lib/gameId";
import { getCurrentWordFromAirTable } from "../../lib/airtable";
import { getSolution } from "../../lib/helpers";

export default async function handler(req, res) {
  res.status(200).json(await getSolution(req.query.l));
}
