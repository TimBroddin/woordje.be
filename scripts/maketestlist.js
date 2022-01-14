const fs = require("fs").promises;

(async () => {
  const woorden = JSON.parse(await fs.readFile("../data/woorden.json", "utf8"));
  await fs.writeFile(
    "./testwoorden.json",
    JSON.stringify(
      {
        3: woorden[3].slice(0, 15),
        4: woorden[4].slice(0, 15),
        5: woorden[5].slice(0, 15),
        6: woorden[6].slice(0, 15),
        7: woorden[7].slice(0, 15),
        8: woorden[8].slice(0, 15),
      },
      null,
      2
    )
  );
})();
