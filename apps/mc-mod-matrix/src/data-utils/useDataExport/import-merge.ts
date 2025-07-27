import { importMods } from "./mod";
import { importPacks } from "./pack";
import { importPlatformMods } from "./platformMods";

import type { GameVersion, Mod, StoredModpack } from "@mcmm/data";
import type { DataRegistry, PlatformModVersionDbEntry } from "~/data";
import type { AppDataExport, ImportPreview } from "./types";

//================================================

export const applyDataImport = async (
  data: ImportPreview,
  dataRegistry: DataRegistry,
): Promise<Record<string, string>> => {
  const modIdMapping: Record<string, string> = {};

  await dataRegistry.db.transaction(
    "rw",
    dataRegistry.db.mods,
    dataRegistry.db.platformMods,
    dataRegistry.db.platformModVersions,
    tx => {},
  );

  return modIdMapping;
};

export const prepareDataImport = async (
  externalData: AppDataExport,
  dataRegistry: DataRegistry,
  packs: StoredModpack[],
  allGameVersions: GameVersion[],
  commonMods: Mod["id"][] = [],
): Promise<ImportPreview> => {
  const newVersions: PlatformModVersionDbEntry[] = [];
  for (const version of externalData.db.platformModVersions) {
    if (!(await dataRegistry.db.platformModVersions.get(version))) {
      newVersions.push(version);
    }
  }

  const platformModMetaUpdates = await importPlatformMods(
    externalData.db.platformMods,
    dataRegistry,
  );

  const modUpdates = await importMods(externalData.db.mods, dataRegistry);

  const mappedPacks = externalData.packs.map(pack => ({
    ...pack,
    mods: pack.mods.map(id => modUpdates.idMapping[id] ?? id),
  }));

  const packUpdates = importPacks(mappedPacks, packs, allGameVersions, commonMods);

  return {
    mods: modUpdates,
    platformMods: platformModMetaUpdates,
    platformModVersions: newVersions,
    packs: packUpdates,
  };
};
