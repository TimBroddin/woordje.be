/**
 * Debug script to check Turso data
 */

import { createClient } from "@libsql/client";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

async function debug() {
  const turso = createClient({
    url: process.env.TURSO_URL,
    authToken: process.env.TURSO_AUTH_TOKEN,
  });

  console.log("Checking Turso data...\n");

  // Check if tables exist
  console.log("=== TABLES ===");
  try {
    const tables = await turso.execute(
      "SELECT name FROM sqlite_master WHERE type='table'"
    );
    console.log("Tables:", tables.rows.map((r) => r.name).join(", "));
  } catch (err) {
    console.error("Error listing tables:", err.message);
  }

  console.log("\n=== STATS TABLE ===");
  try {
    // Get schema
    const schema = await turso.execute("PRAGMA table_info(stats)");
    console.log("Columns:", schema.rows.map((r) => r.name).join(", "));

    // Get count
    const count = await turso.execute("SELECT COUNT(*) as count FROM stats");
    console.log("Total rows:", count.rows[0].count);

    // Get sample
    const sample = await turso.execute("SELECT * FROM stats LIMIT 5");
    console.log("Sample rows:");
    sample.rows.forEach((row, i) => console.log(`  Row ${i + 1}:`, JSON.stringify(row)));

    // Get max gameId
    const maxGame = await turso.execute(
      "SELECT * FROM stats ORDER BY gameId DESC LIMIT 5"
    );
    console.log("Highest gameId rows:");
    maxGame.rows.forEach((row) => console.log("  ", JSON.stringify(row)));

    // Check for gameId 1464
    console.log("\nChecking for gameId 1464:");
    const game1464 = await turso.execute({
      sql: "SELECT * FROM stats WHERE gameId BETWEEN ? AND ?",
      args: [1460, 1470],
    });
    if (game1464.rows.length > 0) {
      game1464.rows.forEach((row) => console.log("  ", JSON.stringify(row)));
    } else {
      console.log("  No rows found for gameId 1460-1470");
    }
  } catch (err) {
    console.error("Error querying stats:", err.message);
  }

  console.log("\n=== STATS DISTRIBUTION TABLE ===");
  try {
    // Get count
    const count = await turso.execute(
      "SELECT COUNT(*) as count FROM StatsDistribution"
    );
    console.log("Total rows:", count.rows[0].count);

    // Get sample
    const sample = await turso.execute("SELECT * FROM StatsDistribution LIMIT 5");
    console.log("Sample rows:");
    sample.rows.forEach((row, i) => console.log(`  Row ${i + 1}:`, JSON.stringify(row)));
  } catch (err) {
    console.error("Error querying StatsDistribution:", err.message);
  }
}

debug().catch(console.error);
