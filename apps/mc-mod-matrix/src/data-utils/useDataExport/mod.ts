import { v4 as uuid } from "uuid";

import { getMinGameVersion } from "@mcmm/utils";

import type { DataRegistry, ModDbEntry } from "~/data";
import type { ImportDryRunResult } from "./types";

//================================================

const reconcileIncomingId = async (
  incoming: ModDbEntry,
  result: ImportDryRunResult<ModDbEntry>,
  dataRegistry: DataRegistry,
) => {
  const initialId = incoming.id;
  let hasConflictingId = !!(await dataRegistry.db.mods.get(incoming.id));
  if (!hasConflictingId) {
    return;
  }

  while (hasConflictingId) {
    incoming.id = uuid();
    hasConflictingId = !!(await dataRegistry.db.mods.get(incoming.id));
  }

  result.idMapping[initialId] = incoming.id;
};

const processExactMatch = (
  incoming: ModDbEntry,
  existing: ModDbEntry,
  result: ImportDryRunResult<ModDbEntry>,
) => {
  if (incoming.id !== existing.id) {
    result.idMapping[incoming.id] = existing.id;
  }
  const newMinGameVersionFetched = getMinGameVersion(
    incoming.minGameVersionFetched,
    existing.minGameVersionFetched,
  );

  if (newMinGameVersionFetched !== existing.minGameVersionFetched) {
    result.recordsToUpdate[existing.id] = entry => {
      entry.minGameVersionFetched = newMinGameVersionFetched;
    };
  }
};

const updateExistingRecordsInMergeConflicts = (
  existing: ModDbEntry | ModDbEntry[],
  result: ImportDryRunResult<ModDbEntry>,
) => {
  const processOne = (e: ModDbEntry) => {
    if (!result.recordsToUpdate[e.id]) {
      return e;
    }
    const copy = { ...e };
    result.recordsToUpdate[e.id](copy);
    return copy;
  };

  return Array.isArray(existing) ? existing.map(processOne) : processOne(existing);
};

export const importMods = async (
  items: ModDbEntry[],
  dataRegistry: DataRegistry,
): Promise<ImportDryRunResult<ModDbEntry>> => {
  const result: ImportDryRunResult<ModDbEntry> = {
    recordsToUpdate: {},
    recordsToAdd: [],
    idMapping: {},
    mergeConflicts: [],
  };

  for (const incoming of items) {
    const possibleDupes = await dataRegistry.db.mods
      .where("platforms")
      .anyOf(incoming.platforms)
      .distinct()
      .toArray();

    if (!possibleDupes.length) {
      await reconcileIncomingId(incoming, result, dataRegistry);
      result.recordsToAdd.push(incoming);
      continue;
    }
    if (possibleDupes.length > 1) {
      await reconcileIncomingId(incoming, result, dataRegistry);
      result.mergeConflicts?.push({ incoming: incoming, existing: possibleDupes });
      continue;
    }

    const existing = possibleDupes[0];
    const incomingIdsStr = incoming.platforms.slice().sort().join();
    const existingIdsStr = existing.platforms.slice().sort().join();

    if (existingIdsStr === incomingIdsStr) {
      processExactMatch(incoming, existing, result);
    } else if (existingIdsStr.includes(incomingIdsStr)) {
      if (incoming.id !== existing.id) {
        result.idMapping[incoming.id] = existing.id;
      }
    } else if (incomingIdsStr.includes(existingIdsStr)) {
      if (incoming.id !== existing.id) {
        result.idMapping[incoming.id] = existing.id;
      }
      result.recordsToUpdate[existing.id] = entry => {
        entry.platforms = incoming.platforms;
        entry.minGameVersionFetched = incoming.minGameVersionFetched;
      };
    } else {
      await reconcileIncomingId(incoming, result, dataRegistry);
      result.mergeConflicts?.push({ incoming, existing });
    }
  }

  const replaceIds = (mod: ModDbEntry) => ({
    ...mod,
    id: result.idMapping[mod.id] || mod.id,
    alternatives: mod.alternatives.map(id => result.idMapping[id] || id),
  });

  const previewIncomingModsWithNewIds = items.map(replaceIds);
  const modsWithNewIdsMap = Object.fromEntries(
    previewIncomingModsWithNewIds.map(mod => [mod.id, mod]),
  );

  result.recordsToAdd = result.recordsToAdd.map(replaceIds);

  result.mergeConflicts = result.mergeConflicts?.map(({ incoming, existing }) => ({
    incoming: replaceIds(incoming),
    existing: updateExistingRecordsInMergeConflicts(existing, result),
  }));

  Object.entries(result.recordsToUpdate).forEach(([id, updateFn]) => {
    const incoming = modsWithNewIdsMap[id];
    if (!incoming) {
      return;
    }

    result.recordsToUpdate[id] = existing => {
      updateFn(existing);
      const newAlternatives = Array.from(
        new Set([...existing.alternatives, ...incoming.alternatives]),
      );
      const newAltIdsStr = newAlternatives.slice().sort().join();
      const existingAltIdsStr = existing.alternatives.slice().sort().join();
      if (newAltIdsStr !== existingAltIdsStr) {
        existing.alternatives = newAlternatives;
      }
    };
  });

  return result;
};
