/**
 * CI / local proof that Loki received HustleHub+ API logs.
 * Usage: node scripts/check-loki.js [lokiBaseUrl]
 */

const baseUrl = process.argv[2] || process.env.LOKI_QUERY_URL || "http://localhost:3100";
const timeoutMs = Number(process.env.LOKI_WAIT_MS) || 60000;
const query = '{service="hustlehub-api"}';

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function ready() {
  const response = await fetch(`${baseUrl}/ready`);
  return response.ok;
}

async function streamCount() {
  const endNs = `${Date.now()}000000`;
  const startNs = `${Date.now() - 15 * 60 * 1000}000000`;
  const url =
    `${baseUrl}/loki/api/v1/query_range?query=${encodeURIComponent(query)}` +
    `&start=${startNs}&end=${endNs}&limit=20`;
  const response = await fetch(url);
  if (!response.ok) {
    return 0;
  }
  const body = await response.json();
  return Array.isArray(body.data?.result) ? body.data.result.length : 0;
}

async function main() {
  const deadline = Date.now() + timeoutMs;

  while (Date.now() < deadline) {
    try {
      if (await ready()) {
        const count = await streamCount();
        if (count > 0) {
          console.log(`Loki ingested ${count} stream(s) for ${query}`);
          process.exit(0);
        }
      }
    } catch (error) {
      console.log(`Waiting for Loki: ${error.message}`);
    }
    await sleep(3000);
  }

  console.error(`Loki did not ingest ${query} within ${timeoutMs}ms`);
  process.exit(1);
}

main();
