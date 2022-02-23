import { getSolution } from "@/lib/server";

export default async function handler(req, res) {
  const locale = req.query.locale;
  res
    .status(200)
    .json(await getSolution(req.query.l, req.query.gameId, locale));
}
