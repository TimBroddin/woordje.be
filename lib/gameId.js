export function getGameId() {
  const oneDay = 24 * 60 * 60 * 1000; // hours*minutes*seconds*milliseconds
  const firstDate = new Date(2022, 0, 10).valueOf() - oneDay;
  const secondDate = new Date().valueOf();

  return Math.round(Math.abs((firstDate - secondDate) / oneDay)) + 1;
}
