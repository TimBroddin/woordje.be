/**
 * Debug script to check Supabase data structure
 */

import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

async function debug() {
  const supabase = createClient(
    process.env.SUPABASE_URL || "https://repfezfjwchqlrkatwta.supabase.co",
    process.env.SUPABASE_KEY
  );

  console.log("Fetching sample data from Supabase...\n");

  // Get sample stats row
  const { data: stats, error: statsError } = await supabase
    .from("stats")
    .select("*")
    .limit(5);

  if (statsError) {
    console.error("Error fetching stats:", statsError);
  } else {
    console.log("=== STATS TABLE ===");
    console.log("Column names:", stats.length > 0 ? Object.keys(stats[0]) : "No data");
    console.log("Sample rows:");
    stats.forEach((row, i) => console.log(`  Row ${i + 1}:`, JSON.stringify(row)));
  }

  console.log("\n");

  // Get sample distribution row
  const { data: dist, error: distError } = await supabase
    .from("StatsDistribution")
    .select("*")
    .limit(5);

  if (distError) {
    console.error("Error fetching StatsDistribution:", distError);
  } else {
    console.log("=== STATS DISTRIBUTION TABLE ===");
    console.log("Column names:", dist.length > 0 ? Object.keys(dist[0]) : "No data");
    console.log("Sample rows:");
    dist.forEach((row, i) => console.log(`  Row ${i + 1}:`, JSON.stringify(row)));
  }

  console.log("\n");

  // Check total counts
  const { count: statsCount } = await supabase
    .from("stats")
    .select("*", { count: "exact", head: true });

  const { count: distCount } = await supabase
    .from("StatsDistribution")
    .select("*", { count: "exact", head: true });

  console.log("=== TOTAL COUNTS ===");
  console.log(`  Stats rows: ${statsCount}`);
  console.log(`  Distribution rows: ${distCount}`);

  // Check for gameId around 1464
  console.log("\n=== CHECKING FOR GAMEID 1464 ===");
  const { data: game1464 } = await supabase
    .from("stats")
    .select("*")
    .gte("gameId", 1460)
    .lte("gameId", 1470);

  if (game1464 && game1464.length > 0) {
    console.log("Found rows with gameId 1460-1470:");
    game1464.forEach((row) => console.log("  ", JSON.stringify(row)));
  } else {
    // Try snake_case
    const { data: game1464Snake } = await supabase
      .from("stats")
      .select("*")
      .gte("game_id", 1460)
      .lte("game_id", 1470);

    if (game1464Snake && game1464Snake.length > 0) {
      console.log("Found rows with game_id 1460-1470 (snake_case!):");
      game1464Snake.forEach((row) => console.log("  ", JSON.stringify(row)));
    } else {
      console.log("No rows found for gameId/game_id 1460-1470");
    }
  }

  // Check max gameId
  console.log("\n=== MAX GAMEID ===");
  const { data: maxGame } = await supabase
    .from("stats")
    .select("*")
    .order("gameId", { ascending: false })
    .limit(5);

  if (maxGame && maxGame.length > 0) {
    console.log("Highest gameId rows:");
    maxGame.forEach((row) => console.log("  ", JSON.stringify(row)));
  }
}

debug().catch(console.error);
