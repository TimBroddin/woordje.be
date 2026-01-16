import { unstable_cache } from "next/cache";
import getTurso from "@/lib/turso";

async function getStatisticsUncached(gameId, wordLength, gameType) {
  const turso = getTurso();

  const statsResult = await turso.execute({
    sql: "SELECT wins, total FROM stats WHERE gameId = ? AND wordLength = ? AND gameType = ?",
    args: [gameId, wordLength, gameType],
  });

  const statsRow = statsResult.rows[0];
  const wins = statsRow
    ? Math.round((statsRow.wins / statsRow.total) * 100)
    : 0;
  const total = statsRow ? statsRow.total : 0;

  const distributionResult = await turso.execute({
    sql: "SELECT tries, amount FROM StatsDistribution WHERE gameId = ? AND wordLength = ? AND gameType = ?",
    args: [gameId, wordLength, gameType],
  });

  const distribution = distributionResult.rows.map((row) => ({
    tries: row.tries,
    amount: total ? Math.round((row.amount / total) * 100) : 0,
  }));

  return { wins, distribution };
}

export const getStatistics = unstable_cache(
  getStatisticsUncached,
  ["statistics"],
  { revalidate: 300, tags: ["statistics"] }
);
