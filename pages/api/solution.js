import { currentLocale } from "../../lib/ssr";
import { getSolution } from "../../lib/ssr";

export default async function handler(req, res) {
  const locale = currentLocale(req);
  res
    .status(200)
    .json(await getSolution(req.query.l, req.query.gameId, locale));
}
