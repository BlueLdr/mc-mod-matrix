import type { StoredModpack } from "@mcmm/data";
import type {
  DataRegistryExportedData,
  ModDbEntry,
  PlatformModDbEntry,
  PlatformModVersionDbEntry,
} from "~/data";

//================================================

export interface AppDataExport {
  db: DataRegistryExportedData;
  packs: StoredModpack[];
}

export interface MergeConflict<T> {
  existing: T | T[];
  incoming: T;
}

export interface ImportDryRunResult<T> {
  recordsToUpdate: Record<string, (record: T) => void>;
  recordsToAdd: T[];
  idMapping: Record<string, string>;
  mergeConflicts?: MergeConflict<T>[];
}

export interface ImportPreview {
  mods: ImportDryRunResult<ModDbEntry>;
  platformMods: ImportDryRunResult<PlatformModDbEntry>;
  platformModVersions: PlatformModVersionDbEntry[];
  packs: ImportDryRunResult<StoredModpack>;
}
