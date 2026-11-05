import { fetchResilient, HttpError, USER_AGENT } from "../util/net";
import { unescapeEntities } from "./rss";
import { parseSize } from "../util/format";
import type { SearchOptions, Source, TorrentResult } from "./types";

const HOSTS = [
  "https://tgx.rs",
  "https://torrentgalaxy.to",
  "https://tgx.sb",
  "https://torrentgalaxy.mx",
];

// Regex-based HTML parser — avoids a DOM dependency while staying compatible
// with the existing codebase pattern used by piratebay.ts and x1337.ts.

interface Row {
  name: string;
  magnet: string;
  seeders: number;
  leechers: number;
  sizeBytes: number;
}

function parseRows(html: string): Row[] {
  const out: Row[] = [];

  // TorrentGalaxy search results: each torrent lives in a <div class="tgxtablerow ...">
  // We split on those divs and parse each one individually.
  const rows = html.split(/class="tgxtablerow/i).slice(1);

  for (const row of rows) {
    // Magnet link — directly on the results page (no detail page needed)
    const magnetMatch = row.match(/href="(magnet:[^"]+)"/i);
    if (!magnetMatch) continue;
    const magnet = unescapeEntities(magnetMatch[1]!.trim());

    // Title: first <a href="/torrent/..."> text content
    const nameMatch = row.match(/href="\/torrent\/[^"]+">([^<]+)</i);
    if (!nameMatch) continue;
    const name = unescapeEntities(nameMatch[1]!.trim());
    if (!name) continue;

    // Seeders: green font color
    const seedMatch = row.match(/font color="green"><b>(\d+)<\/b>/i);
    const seeders = seedMatch ? Number(seedMatch[1]) : 0;

    // Leechers: red font color
    const leechMatch = row.match(/font color="#ff0000"><b>(\d+)<\/b>/i);
    const leechers = leechMatch ? Number(leechMatch[1]) : 0;

    // Size: look for a size string like "1.5 GB" or "700 MB"
    const sizeMatch = row.match(/([\d.]+\s*[KMGT]i?B)/i);
    const sizeBytes = sizeMatch ? parseSize(sizeMatch[1]!) : 0;

    out.push({ name, magnet, seeders, leechers, sizeBytes });
  }

  return out;
}

async function search(query: string, opts: SearchOptions = {}): Promise<TorrentResult[]> {
  const q = query.trim();
  const path = q
    ? `/torrents.php?search=${encodeURIComponent(q)}&lang=0&nox=2&order=seeders&by=DESC`
    : `/torrents.php?lang=0&nox=2&order=seeders&by=DESC`;

  let html = "";
  let lastError: unknown;

  for (const host of HOSTS) {
    try {
      const res = await fetchResilient(`${host}${path}`, {
        headers: { "User-Agent": USER_AGENT, "Referer": host },
        signal: opts.signal,
        retries: 1,
      });
      if (!res.ok) throw new HttpError(res.status, `TorrentGalaxy returned ${res.status}`);
      html = await res.text();
      break;
    } catch (e) {
      if (opts.signal?.aborted) throw e;
      lastError = e;
    }
  }

  if (!html) {
    throw lastError instanceof Error
      ? lastError
      : new HttpError(0, "TorrentGalaxy unreachable");
  }

  const rows = parseRows(html);
  rows.sort((a, b) => b.seeders - a.seeders);

  return rows.slice(0, 20).map((row): TorrentResult => {
    const infoHash =
      row.magnet.match(/urn:btih:([a-fA-F0-9]+)/i)?.[1]?.toLowerCase() ?? "";
    return {
      infoHash,
      name: row.name,
      sizeBytes: row.sizeBytes,
      seeders: row.seeders,
      leechers: row.leechers,
      source: "torrentgalaxy",
      magnet: row.magnet,
    };
  }).filter((r) => r.infoHash !== "");
}

export const torrentgalaxy: Source = {
  id: "torrentgalaxy",
  label: "TGalaxy",
  groups: ["General"],
  homepage: "https://torrentgalaxy.to",
  reportsHealth: true,
  search,
};
