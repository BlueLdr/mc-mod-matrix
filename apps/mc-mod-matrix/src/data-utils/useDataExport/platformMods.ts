import { gameVersionComparator } from "@mcmm/utils";

import type { DataRegistry, PlatformModDbEntry } from "~/data";
import type { ImportDryRunResult } from "./types";

//================================================

export const importPlatformMods = async (
  items: PlatformModDbEntry[],
  dataRegistry: DataRegistry,
): Promise<ImportDryRunResult<PlatformModDbEntry>> => {
  const result: ImportDryRunResult<PlatformModDbEntry> = {
    recordsToUpdate: {},
    recordsToAdd: [],
    idMapping: {},
  };

  for (const item of items) {
    const existingItem = await dataRegistry.db.platformMods
      .where("[meta.id+meta.platform]")
      .equals([item.meta.id, item.meta.platform])
      .first();
    if (!existingItem) {
      result.recordsToAdd.push(item);
      continue;
    }

    if (!item.meta.minGameVersionFetched) {
      continue;
    }
    if (
      !existingItem.meta.minGameVersionFetched ||
      gameVersionComparator(
        item.meta.minGameVersionFetched,
        existingItem.meta.minGameVersionFetched,
      ) < 0
    ) {
      result.recordsToUpdate[existingItem.id] = entry => {
        entry.meta.minGameVersionFetched = item.meta.minGameVersionFetched;
      };
    }
  }

  return result;
};
