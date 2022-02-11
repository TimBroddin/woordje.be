import { getRandomWord } from "../../lib/ssr";

export default function handler(req, res) {
  const WORD_LENGTH = parseInt(req.query?.l);
  const word = getRandomWord(WORD_LENGTH);
  res.status(200).send(word);
}
