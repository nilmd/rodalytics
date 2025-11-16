const lines = require("./lines");
const { fetchAllIncidents } = require("./fetch");
const { initDatabase, storeIncidents, closeDatabase } = require("./store");

/**
 * Main collector function
 */
async function runCollector() {
  console.log("🚂 Rodalytics Data Collector");
  console.log("===========================");
  console.log(`Started at: ${new Date().toISOString()}\n`);

  try {
    // Step 1: Fetch incidents from all lines
    console.log("📡 Fetching RSS feeds...");
    const incidents = await fetchAllIncidents(lines);
    console.log(`\n📊 Total incidents fetched: ${incidents.length}\n`);

    // Step 2: Initialize database
    console.log("💾 Connecting to database...");
    const db = await initDatabase();

    // Step 3: Store incidents
    console.log("💿 Storing incidents...");
    const stats = await storeIncidents(db, incidents);

    // Step 4: Close database
    await closeDatabase(db);

    // Step 5: Report results
    console.log("\n✅ Collection complete!");
    console.log(`   New incidents: ${stats.inserted}`);
    console.log(`   Already stored: ${stats.skipped}`);
    console.log(`   Total processed: ${stats.total}`);
    console.log(`\nFinished at: ${new Date().toISOString()}`);

    process.exit(0);
  } catch (error) {
    console.error("\n❌ Error during collection:", error);
    process.exit(1);
  }
}

// Run if this file is executed directly
if (require.main === module) {
  runCollector();
}

module.exports = { runCollector };
