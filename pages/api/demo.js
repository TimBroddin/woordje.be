import woorden from "../../data/woorden.json";

export default function handler(req, res) {
  const WORD_LENGTH = parseInt(req.query.l);

  const words = [];

  for (let i = 0; i < 3; i++) {
    words.push(
      woorden[WORD_LENGTH][
        Math.floor(Math.random() * woorden[WORD_LENGTH].length)
      ]
    );
  }

  res.status(200).json(words);
}
