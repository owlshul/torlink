import { bittorrented } from "./bittorrented";
import { eztv } from "./eztv";
import { fitgirl } from "./fitgirl";
import { nyaa } from "./nyaa";
import { subsplease } from "./subsplease";
import { tpbMovies, tpbTv, tpbApps } from "./piratebay";
import { x1337Movies, x1337Tv, x1337Apps } from "./x1337";
import { yts } from "./yts";
import { knaben } from "./knaben";
import { torrentgalaxy } from "./torrentgalaxy";
import type { Source, SourceGroup, SourceId } from "./types";

export const SOURCES: readonly Source[] = [
  fitgirl,
  yts,
  tpbMovies,
  x1337Movies,
  eztv,
  tpbTv,
  x1337Tv,
  nyaa,
  subsplease,
  tpbApps,
  x1337Apps,
  knaben,
  torrentgalaxy,
  bittorrented,
];

export const DEFAULT_SOURCE: Source = SOURCES[0]!;

export function getSource(id: SourceId): Source {
  return SOURCES.find((s) => s.id === id) ?? DEFAULT_SOURCE;
}

const GROUP_ORDER: readonly SourceGroup[] = ["Games", "Movies", "TV", "Anime", "General", "Software"];

export function sourcesByGroup(): { group: SourceGroup; sources: Source[] }[] {
  return GROUP_ORDER.map((group) => ({
    group,
    sources: SOURCES.filter((s) => s.groups?.includes(group)),
  })).filter((g) => g.sources.length > 0);
}
