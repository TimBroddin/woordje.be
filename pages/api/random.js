import woorden from "../../data/woorden.json";

export default function handler(req, res) {
  const WORD_LENGTH = parseInt(req.query?.l);

  const idx = Math.floor(Math.random() * woorden[WORD_LENGTH].length);
  const word = woorden[WORD_LENGTH][idx];
  res.status(200).send(word);
}
