import type * as Immutable from "immutable";
import type { Mod } from "@mcmm/data";
import type { Curseforge } from "@mcmm/curseforge";

//================================================

export type DataRegistryMap = Immutable.Map<string | number, Mod>;
export type DataRegistryEntryRecord = Record<string | number, DataRegistryEntry>;
export type DataRegistryEntryMap = Immutable.Map<string | number, DataRegistryEntry>;

export interface DataRegistryEntry {
  dateModified: number;
  minGameVersionFetched: string;
  data: Mod;
}

export interface CurseforgeVersionTypeRegistry {
  raw: Curseforge.VersionsByType[];
}

export interface DataRegistryStorageState {
  lastRefresh: number;
  registry: DataRegistryEntryRecord;
  // curseforgeVersionTypeRegistry: CurseforgeVersionTypeRegistry;
}
