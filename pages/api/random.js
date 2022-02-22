import { getRandomWord } from "../../lib/ssr";

export default function handler(req, res) {
  const wordLength = parseInt(req.query?.l);
  const word = getRandomWord(wordLength);
  res.status(200).send(word);
}
