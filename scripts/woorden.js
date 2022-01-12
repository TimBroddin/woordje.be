const fs = require("fs").promises;

function shuffle(array) {
  let currentIndex = array.length,
    randomIndex;

  // While there remain elements to shuffle...
  while (currentIndex != 0) {
    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;

    // And swap it with the current element.
    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex],
      array[currentIndex],
    ];
  }

  return array;
}

(async () => {
  const levels = [3, 4, 5, 6, 7, 8];
  const files = ["gekeurd.txt", "ongekeurd.txt", "flexievormen.txt"];

  const output = {};

  let words = [];
  for (const length of levels) {
    let words = [];
    for (const file of files) {
      const content = await fs.readFile(file, "utf-8");
      const lines = content.split("\n");
      const w = lines
        .map((word) => word.toLowerCase())
        .filter((word) => word.length === length)
        .filter((word) => word.match(/[a-z]/g).length === length);
      words = [...words, ...w];
    }
    output[length] = shuffle(words);
  }

  await fs.writeFile(`../data/woorden2.json`, JSON.stringify(output));
})();
