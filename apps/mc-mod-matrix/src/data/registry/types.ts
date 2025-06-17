import type Dexie from "dexie";
import type { EntityTable } from "dexie";
import type * as Immutable from "immutable";
import type { Mod } from "@mcmm/data";
import type { Curseforge } from "@mcmm/curseforge";

//================================================

export type DataRegistryMap = Immutable.Map<string | number, Mod>;
export type DataRegistryEntryMap = Immutable.Map<string | number, DataRegistryEntry>;

export interface DataRegistryDbEntryMeta {
  dateModified: number;
  minGameVersionFetched: string;
}

export interface DataRegistryDbEntry extends DataRegistryDbEntryMeta, Mod {}

export interface DataRegistryEntry extends DataRegistryDbEntryMeta {
  modId: Mod["id"];
  data: Mod;
}

export interface CurseforgeVersionTypeRegistry {
  raw: Curseforge.VersionsByType[];
}

export interface DataRegistryStorageState {
  lastRefresh: number;
  // curseforgeVersionTypeRegistry: CurseforgeVersionTypeRegistry;
}

export interface DataRegistryDb extends Dexie {
  lastRefresh: number;
  registry: EntityTable<DataRegistryDbEntry, "id">;
}
