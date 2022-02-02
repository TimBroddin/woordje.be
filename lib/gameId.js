export function getGameId() {
  const oneDay = 24 * 60 * 60 * 1000;
  const firstDate = new Date("Sun Jan 09 2022 00:00:00 GMT+0100");
  const secondDate = new Date().valueOf();

  return Math.floor(Math.abs((firstDate - secondDate) / oneDay)) + 1;
}
