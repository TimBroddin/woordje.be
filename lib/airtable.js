import Airtable from "airtable";
import { getGameId } from "./gameId";

const airtableCache = {};

const getCurrentWordFromAirTable = async () => {
  const gameId = getGameId();
  if (airtableCache[gameId]) {
    return airtableCache[gameId];
  } else {
    console.log(process.env.AIRTABLE_API_KEY);
    const base = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY }).base(
      process.env.AIRTABLE_BASE
    );

    const record = await base("woorden")
      .select({
        maxRecords: 1,

        filterByFormula: `{Id} = ${gameId - 1}`,
      })
      .firstPage();
    airtableCache[gameId] = record[0]?.fields;
    return record[0]?.fields;
  }
};

export { getCurrentWordFromAirTable };
