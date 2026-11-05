import { fetchResilient, HttpError, USER_AGENT } from "../util/net";
import { buildMagnet } from "./magnet";
import type { SearchOptions, Source, TorrentResult } from "./types";

interface KnabenHit {
  title?: string;
  magnetUrl?: string | null;
  hash?: string | null;
  bytes?: number;
  seeders?: number;
  peers?: number;
  date?: string;
}

interface KnabenResponse {
  hits?: KnabenHit[];
}

async function search(query: string, opts: SearchOptions = {}): Promise<TorrentResult[]> {
  const q = query.trim() || "popular";

  const body = JSON.stringify({
    query: q,
    search_field: "title",
    order_by: "seeders",
    order_direction: "desc",
    size: 25,
    hide_xxx: true,
    hide_unsafe: true,
  });

  const res = await fetchResilient("https://api.knaben.org/v1", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "User-Agent": USER_AGENT,
    },
    body,
    signal: opts.signal,
    retries: 2,
  });

  if (!res.ok) throw new HttpError(res.status, `Knaben returned ${res.status}`);
  const json = (await res.json()) as KnabenResponse;

  const out: TorrentResult[] = [];
  for (const hit of json.hits ?? []) {
    const name = hit.title?.trim();
    if (!name) continue;

    let magnet = hit.magnetUrl ?? null;
    const hash = hit.hash?.toLowerCase() ?? null;

    // Use magnetUrl directly if available; otherwise construct from hash
    if (!magnet && hash) {
      magnet = buildMagnet(hash, name);
    }
    if (!magnet) continue;

    const infoHash = hash ?? magnet.match(/urn:btih:([a-fA-F0-9]+)/i)?.[1]?.toLowerCase() ?? "";
    if (!infoHash) continue;

    const added = hit.date ? Math.floor(new Date(hit.date).getTime() / 1000) : undefined;

    out.push({
      infoHash,
      name,
      sizeBytes: hit.bytes ?? 0,
      seeders: hit.seeders ?? 0,
      leechers: hit.peers ?? 0,
      source: "knaben",
      magnet,
      added,
    });
  }
  return out;
}

export const knaben: Source = {
  id: "knaben",
  label: "Knaben",
  groups: ["General"],
  homepage: "https://knaben.org",
  reportsHealth: true,
  search,
};
