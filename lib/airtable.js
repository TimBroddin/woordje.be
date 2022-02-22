import Airtable from "airtable";
import { getTodaysGameId } from "./gameId";

const airtableCache = {};

const getCurrentWordFromAirTable = async () => {
  const gameId = getTodaysGameId();
  if (airtableCache[gameId]) {
    return airtableCache[gameId];
  } else {
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
