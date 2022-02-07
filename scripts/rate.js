const fs = require("fs").promises;
const v8 = require("v8");
const { keypress } = require("./lib/helpers");

const structuredClone = (obj) => {
  return v8.deserialize(v8.serialize(obj));
};

const argv = require("minimist")(process.argv.slice(2));

const loadSettings = async () => {
  try {
    const settings = JSON.parse(await fs.readFile("./rate.json", "utf8"));
    return settings;
  } catch (err) {
    const defaultValue = 7;
    return {
      start: {
        3: defaultValue,
        4: defaultValue,
        5: defaultValue,
        6: defaultValue,
        7: defaultValue,
        8: defaultValue,
        9: defaultValue,
        10: defaultValue,
      },
      done: { 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0, 9: 0, 10: 0 },
    };
  }
};

const saveSettings = async (settings) => {
  await fs.writeFile("./rate.json", JSON.stringify(settings));
};

const giveWord = async (words, index) => {
  process.stdout.write(`${words[index]} `);
  return await keypress();
};

(async () => {
  const { length: l, live } = argv;
  const length = parseInt(l);
  const woorden = JSON.parse(
    await fs.readFile(
      live ? "../data/woorden.json" : "./testwoorden.json",
      "utf8"
    )
  );
  const copy = structuredClone(woorden);
  const settings = await loadSettings();
  const startIndex = settings.start[length];
  let index = startIndex;

  let keep = [];
  let discard = [];
  while (index < woorden[length].length) {
    const key = await giveWord(woorden[length], index);
    if (key === "left" || key === "right") {
      if (key === "left") {
        keep.push(woorden[length][index]);
        process.stdout.write("✅");
      } else if (key === "right") {
        process.stdout.write("❌");

        discard.push(woorden[length][index]);
      }

      process.stdout.write(` K:${keep.length} D:${discard.length}\n`);

      index++;
    }

    if (key === "save" || index === woorden[length].length - 1) {
      copy[length] = [
        ...woorden[length].filter((a) => discard.indexOf(a) === -1),
        ...discard,
      ];
      console.log(`Writing, ${keep.length} keepers`);
      await fs.writeFile(
        live ? "../data/woorden.json" : "./testwoorden.json",
        JSON.stringify(copy)
      );
      settings.start[length] = index;
      settings.done[length] = index - startIndex;
      await saveSettings(settings);
      process.exit();
    }
  }
})().then(process.exit);
