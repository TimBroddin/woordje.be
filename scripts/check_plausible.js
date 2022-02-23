require("dotenv").config();
const fetch = require("node-fetch");
const { PrismaClient } = require("@prisma/client");

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

const prisma = new PrismaClient();

const fetchAmount = async function (gameId, letters, field = "win") {
  const res = await fetch(
    `https://plausible.io/api/v1/stats/aggregate?site_id=woordje.be&period=6mo&filters=event:name%3D%3Dwin;event:name==${field};event:props:game==${gameId}x${letters}`,
    { headers: { Authorization: `Bearer ${process.env.PLAUSIBLE_API_KEY}` } }
  );
  const json = await res.json();
  return json?.results?.visitors?.value;
};

const getWinsAndLoses = async function (gameId, letters) {
  return {
    wins: await fetchAmount(gameId, letters, "win"),
    loses: await fetchAmount(gameId, letters, "lose"),
  };
};

const getEvents = async function () {
  const maxGameId = 42;
  const letters = [3, 4, 5, 6, 7, 8, 9, 10];

  for (let gameId = 1; gameId < maxGameId; gameId++) {
    for (let letter of letters) {
      const row = await prisma.stats.findUnique({
        where: {
          gameId_letters: {
            gameId,
            letters: letter,
          },
        },
      });

      const date = new Date();

      if (!row || row.updatedAt < date.setHours(date.getHours() - 12)) {
        const { wins, loses } = await getWinsAndLoses(gameId, letter);
        await prisma.stats.upsert({
          where: {
            gameId_letters: {
              gameId,
              letters: letter,
            },
          },
          create: {
            gameId,
            letters: letter,
            wins,
            loses,
          },
          update: {
            wins,
            loses,
          },
        });

        await sleep(100);
      }
    }
  }
};

getEvents();
