/**
 * Migration script: Supabase to Turso
 *
 * Prerequisites:
 * 1. Create Turso database at https://turso.tech
 * 2. Run these SQL commands in Turso to create tables:
 *
 *    CREATE TABLE stats (
 *      gameId INTEGER NOT NULL,
 *      wordLength INTEGER NOT NULL,
 *      gameType TEXT NOT NULL,
 *      wins INTEGER NOT NULL DEFAULT 0,
 *      total INTEGER NOT NULL DEFAULT 0,
 *      PRIMARY KEY (gameId, wordLength, gameType)
 *    );
 *
 *    CREATE TABLE StatsDistribution (
 *      gameId INTEGER NOT NULL,
 *      wordLength INTEGER NOT NULL,
 *      gameType TEXT NOT NULL,
 *      tries INTEGER NOT NULL,
 *      amount INTEGER NOT NULL DEFAULT 0,
 *      PRIMARY KEY (gameId, wordLength, gameType, tries)
 *    );
 *
 * 3. Set environment variables:
 *    - SUPABASE_URL (your old Supabase URL)
 *    - SUPABASE_KEY (your old Supabase anon key)
 *    - TURSO_URL (your new Turso database URL)
 *    - TURSO_AUTH_TOKEN (your Turso auth token)
 *
 * Usage:
 *    node scripts/migrate-to-turso.js
 */

import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { createClient as createTursoClient } from "@libsql/client";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const BATCH_SIZE = 100;
const SUPABASE_PAGE_SIZE = 1000; // Supabase default limit

/**
 * Fetch all rows from a Supabase table, handling pagination
 */
async function fetchAllFromSupabase(supabase, tableName) {
  const allRows = [];
  let from = 0;
  let hasMore = true;

  while (hasMore) {
    const { data, error } = await supabase
      .from(tableName)
      .select("*")
      .range(from, from + SUPABASE_PAGE_SIZE - 1);

    if (error) {
      throw new Error(`Error fetching ${tableName}: ${error.message}`);
    }

    if (data && data.length > 0) {
      allRows.push(...data);
      console.log(`  Fetched ${allRows.length} rows so far...`);
      from += SUPABASE_PAGE_SIZE;
      hasMore = data.length === SUPABASE_PAGE_SIZE;
    } else {
      hasMore = false;
    }
  }

  return allRows;
}

async function migrate() {
  console.log("Starting migration from Supabase to Turso...\n");

  // Connect to Supabase
  const supabase = createSupabaseClient(
    process.env.SUPABASE_URL || "https://repfezfjwchqlrkatwta.supabase.co",
    process.env.SUPABASE_KEY
  );

  // Connect to Turso
  const turso = createTursoClient({
    url: process.env.TURSO_URL,
    authToken: process.env.TURSO_AUTH_TOKEN,
  });

  // Verify Turso connection and tables exist
  console.log("Verifying Turso connection...");
  try {
    await turso.execute("SELECT 1");
    console.log("  Turso connection OK\n");
  } catch (err) {
    console.error("Failed to connect to Turso:", err.message);
    process.exit(1);
  }

  // Migrate stats table
  console.log("Fetching stats from Supabase (with pagination)...");
  const stats = await fetchAllFromSupabase(supabase, "stats");
  console.log(`Found ${stats.length} total stats rows to migrate\n`);

  if (stats.length > 0) {
    for (let i = 0; i < stats.length; i += BATCH_SIZE) {
      const batch = stats.slice(i, i + BATCH_SIZE);
      const statements = batch.map((row) => ({
        sql: "INSERT OR REPLACE INTO stats (gameId, wordLength, gameType, wins, total) VALUES (?, ?, ?, ?, ?)",
        args: [row.gameId, row.wordLength, row.gameType, row.wins, row.total],
      }));

      await turso.batch(statements);
      console.log(`  Migrated stats ${i + 1}-${Math.min(i + BATCH_SIZE, stats.length)} of ${stats.length}`);
    }
    console.log("Stats migration complete!\n");
  } else {
    console.log("No stats to migrate.\n");
  }

  // Migrate StatsDistribution table
  console.log("Fetching StatsDistribution from Supabase (with pagination)...");
  const distribution = await fetchAllFromSupabase(supabase, "StatsDistribution");
  console.log(`Found ${distribution.length} total StatsDistribution rows to migrate\n`);

  if (distribution.length > 0) {
    for (let i = 0; i < distribution.length; i += BATCH_SIZE) {
      const batch = distribution.slice(i, i + BATCH_SIZE);
      const statements = batch.map((row) => ({
        sql: "INSERT OR REPLACE INTO StatsDistribution (gameId, wordLength, gameType, tries, amount) VALUES (?, ?, ?, ?, ?)",
        args: [row.gameId, row.wordLength, row.gameType, row.tries, row.amount],
      }));

      await turso.batch(statements);
      console.log(`  Migrated distribution ${i + 1}-${Math.min(i + BATCH_SIZE, distribution.length)} of ${distribution.length}`);
    }
    console.log("StatsDistribution migration complete!\n");
  } else {
    console.log("No StatsDistribution to migrate.\n");
  }

  // Verify migration
  console.log("Verifying migration...");
  const statsCount = await turso.execute("SELECT COUNT(*) as count FROM stats");
  const distCount = await turso.execute("SELECT COUNT(*) as count FROM StatsDistribution");

  console.log("\n========================================");
  console.log("Migration complete!");
  console.log("========================================");
  console.log(`  Supabase stats rows:        ${stats.length}`);
  console.log(`  Turso stats rows:           ${statsCount.rows[0].count}`);
  console.log(`  Supabase distribution rows: ${distribution.length}`);
  console.log(`  Turso distribution rows:    ${distCount.rows[0].count}`);
  console.log("========================================");

  if (statsCount.rows[0].count !== stats.length || distCount.rows[0].count !== distribution.length) {
    console.warn("\n⚠️  Warning: Row counts don't match! Some data may not have been migrated.");
  } else {
    console.log("\n✅ All rows migrated successfully!");
  }
}

migrate().catch(console.error);
