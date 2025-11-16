const sqlite3 = require("sqlite3").verbose();
const crypto = require("crypto");
const path = require("path");

const DB_PATH = path.join(__dirname, "../data/rodalytics.db");

/**
 * Generates a unique hash for an incident
 * @param {Object} incident - Incident object
 * @returns {string} SHA256 hash
 */
function generateHash(incident) {
  const content = `${incident.line}|${incident.title}|${incident.publishedAt}`;
  return crypto.createHash("sha256").update(content).digest("hex");
}

/**
 * Initializes the database and creates tables if needed
 * @returns {Promise<sqlite3.Database>}
 */
function initDatabase() {
  return new Promise((resolve, reject) => {
    const db = new sqlite3.Database(DB_PATH, (err) => {
      if (err) {
        reject(err);
        return;
      }

      db.run(
        `
        CREATE TABLE IF NOT EXISTS incidents (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          line TEXT NOT NULL,
          title TEXT NOT NULL,
          description TEXT,
          published_at TEXT,
          detected_at TEXT NOT NULL,
          hash TEXT UNIQUE NOT NULL
        )
      `,
        (err) => {
          if (err) {
            reject(err);
          } else {
            console.log("✓ Database initialized");
            resolve(db);
          }
        }
      );
    });
  });
}

/**
 * Stores incidents in the database (only new ones)
 * @param {sqlite3.Database} db - Database connection
 * @param {Array} incidents - Array of incident objects
 * @returns {Promise<Object>} Stats about stored incidents
 */
function storeIncidents(db, incidents) {
  return new Promise((resolve, reject) => {
    const stmt = db.prepare(`
      INSERT OR IGNORE INTO incidents (line, title, description, published_at, detected_at, hash)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    let inserted = 0;
    let skipped = 0;
    const detectedAt = new Date().toISOString();

    incidents.forEach((incident) => {
      const hash = generateHash(incident);

      stmt.run(
        incident.line,
        incident.title,
        incident.description,
        incident.publishedAt,
        detectedAt,
        hash,
        function (err) {
          if (err) {
            console.error("Error inserting incident:", err.message);
          } else if (this.changes > 0) {
            inserted++;
          } else {
            skipped++;
          }
        }
      );
    });

    stmt.finalize((err) => {
      if (err) {
        reject(err);
      } else {
        resolve({ inserted, skipped, total: incidents.length });
      }
    });
  });
}

/**
 * Closes the database connection
 * @param {sqlite3.Database} db - Database connection
 */
function closeDatabase(db) {
  return new Promise((resolve, reject) => {
    db.close((err) => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
}

module.exports = { initDatabase, storeIncidents, closeDatabase, generateHash };
