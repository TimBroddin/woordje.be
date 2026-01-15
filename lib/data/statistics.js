import getTurso from "@/lib/turso";

export async function getStatistics(gameId, wordLength, gameType) {
  const turso = getTurso();

  const statsQuery = {
    sql: "SELECT wins, total FROM stats WHERE gameId = ? AND wordLength = ? AND gameType = ?",
    args: [gameId, wordLength, gameType],
  };

  console.log("[Turso Stats] Query:", statsQuery.sql);
  console.log("[Turso Stats] Args:", statsQuery.args);

  const statsResult = await turso.execute(statsQuery);

  console.log("[Turso Stats] Result rows:", statsResult.rows);

  const statsRow = statsResult.rows[0];
  const wins = statsRow
    ? Math.round((statsRow.wins / statsRow.total) * 100)
    : 0;
  const total = statsRow ? statsRow.total : 0;

  const distributionQuery = {
    sql: "SELECT tries, amount FROM StatsDistribution WHERE gameId = ? AND wordLength = ? AND gameType = ?",
    args: [gameId, wordLength, gameType],
  };

  console.log("[Turso Distribution] Query:", distributionQuery.sql);
  console.log("[Turso Distribution] Args:", distributionQuery.args);

  const distributionResult = await turso.execute(distributionQuery);

  console.log("[Turso Distribution] Result rows:", distributionResult.rows);

  const distribution = distributionResult.rows.map((row) => ({
    tries: row.tries,
    amount: total ? Math.round((row.amount / total) * 100) : 0,
  }));

  console.log("[Turso] Final result:", { wins, total, distribution });

  return { wins, distribution };
}
