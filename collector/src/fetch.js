const fetch = require("node-fetch");
const xml2js = require("xml2js");

/**
 * Fetches and parses RSS feed for a single line
 * @param {Object} lineConfig - { line: "R1", url: "https://..." }
 * @returns {Promise<Array>} Array of incident objects
 */
async function fetchLineIncidents(lineConfig) {
  try {
    console.log(`Fetching ${lineConfig.line}...`);

    const response = await fetch(lineConfig.url);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status} for ${lineConfig.line}`);
    }

    const xml = await response.text();
    const parser = new xml2js.Parser();
    const result = await parser.parseStringPromise(xml);

    // Extract items from RSS feed
    const items = result?.rss?.channel?.[0]?.item || [];

    const incidents = items.map((item) => ({
      line: lineConfig.line,
      title: item.title?.[0] || "",
      description: item.description?.[0] || "",
      publishedAt: item.pubDate?.[0] || new Date().toISOString(),
    }));

    console.log(`✓ ${lineConfig.line}: ${incidents.length} incidents found`);
    return incidents;
  } catch (error) {
    console.error(`✗ Error fetching ${lineConfig.line}:`, error.message);
    return [];
  }
}

/**
 * Fetches incidents from all lines
 * @param {Array} lines - Array of line configurations
 * @returns {Promise<Array>} All incidents from all lines
 */
async function fetchAllIncidents(lines) {
  const results = await Promise.all(
    lines.map((line) => fetchLineIncidents(line))
  );

  return results.flat();
}

module.exports = { fetchLineIncidents, fetchAllIncidents };
