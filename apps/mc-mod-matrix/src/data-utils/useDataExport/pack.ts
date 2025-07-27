import { intersection } from "lodash";
import { v4 as uuid } from "uuid";

import { comparator, validateGameVersionRange } from "@mcmm/utils";

import type { GameVersion, Mod, StoredModpack } from "@mcmm/data";
import type { ImportDryRunResult } from "./types";

//================================================

interface PotentialPackMatch {
  pack: StoredModpack;
  modsOverlapPercentage: number;
  modsOverlap: string[];
}

export const MOD_OVERLAP_THRESHOLD = 0.8;
export const LOADER_OVERLAP_THRESHOLD = 0.5;
export const VERSION_OVERLAP_THRESHOLD = 0.5;

//
// const getMatchByName = (incoming: StoredModpack, existingPacks: StoredModpack[]) => {
//   let match: StoredModpack | undefined = undefined;
//   for (const existing of existingPacks) {
//   }
// };

export const importPacks = (
  incomingPacks: StoredModpack[],
  existingPacks: StoredModpack[],
  allGameVersions: GameVersion[],
  commonMods: Mod["id"][],
) => {
  const result: ImportDryRunResult<StoredModpack> = {
    recordsToUpdate: {},
    recordsToAdd: [],
    idMapping: {},
    mergeConflicts: [],
  };

  const getVersionOverlap = makeVersionOverlapGetter(allGameVersions);

  const modsToIgnore = new Set<string>(commonMods);

  for (const incoming of incomingPacks) {
    validateGameVersionRange(incoming.versions);
    let potentialMatches: PotentialPackMatch[] = [];
    for (const existing of existingPacks) {
      validateGameVersionRange(existing.versions);
      const incomingMods = incoming.mods.filter(id => !modsToIgnore.has(id));
      const existingMods = existing.mods.filter(id => !modsToIgnore.has(id));
      const modsOverlap = intersection(incomingMods, existingMods);
      const modsOverlapPercentage =
        (2 * modsOverlap.length) / (incomingMods.length + existingMods.length);

      const loadersOverlap = intersection(incoming.loaders, existing.loaders);
      const loadersOverlapPercentage =
        (2 * loadersOverlap.length) / (incoming.loaders.length + existing.loaders.length);

      const gameVersionsOverlapPercentage = getVersionOverlap(incoming.versions, existing.versions);

      if (
        modsOverlapPercentage >= MOD_OVERLAP_THRESHOLD &&
        loadersOverlapPercentage >= LOADER_OVERLAP_THRESHOLD &&
        gameVersionsOverlapPercentage >= VERSION_OVERLAP_THRESHOLD
      ) {
        potentialMatches.push({
          pack: existing,
          modsOverlapPercentage,
          modsOverlap,
        });
      }
    }

    if (potentialMatches.length === 0) {
      result.recordsToAdd.push(incoming);
      continue;
    }

    const incomingLoaders = incoming.loaders.slice().sort().join();
    if (
      potentialMatches.find(
        match =>
          match.modsOverlapPercentage === 1 &&
          match.pack.name.toLowerCase() === incoming.name.toLowerCase() &&
          match.pack.loaders.slice().sort().join() === incomingLoaders &&
          match.pack.versions.min === incoming.versions.min &&
          match.pack.versions.max === incoming.versions.max,
      )
    ) {
      continue;
    }

    potentialMatches = potentialMatches.sort(comparator("desc", "modsOverlapPercentage"));

    result.mergeConflicts?.push({ incoming, existing: potentialMatches.map(m => m.pack) });
  }

  const existingIds = new Set(existingPacks.map(p => p.id));
  result.recordsToAdd.forEach(pack => {
    while (existingIds.has(pack.id)) {
      pack.id = uuid();
    }
  });

  return result;
};

//================================================

const makeVersionOverlapGetter =
  (versions: GameVersion[]) => (a: StoredModpack["versions"], b: StoredModpack["versions"]) => {
    const aMin = versions.indexOf(a.min);
    const aMax = versions.indexOf(a.max);
    const bMin = versions.indexOf(b.min);
    const bMax = versions.indexOf(b.max);

    if (aMin > bMax || bMin > aMax) {
      return 0;
    }

    const aCount = Math.abs(aMax - aMin) + 1;
    const bCount = Math.abs(bMax - bMin) + 1;
    if (aMin === bMax || bMin === aMax) {
      return 2 / (aCount + bCount);
    }

    const overlap = (aMin < bMax ? bMax - aMin : aMax - bMin) + 1;
    return (2 * overlap) / (aCount + bCount);
  };
