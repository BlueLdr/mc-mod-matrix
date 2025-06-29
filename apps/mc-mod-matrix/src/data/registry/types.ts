import type Dexie from "dexie";
import type { EntityTable } from "dexie";
import type { Mod, ModVersion, PlatformModMetadata } from "@mcmm/data";

//================================================

export interface ModDbEntry extends Omit<Mod, "platforms" | "alternatives" | "versions"> {
  platforms: string[];
  alternatives: string[];
}

//================================================

export interface PlatformModDbEntry<Id extends string | number = string | number> {
  meta: PlatformModMetadata<Id>;
  id: string;
}

export interface PlatformModVersionDbEntry<Id extends string | number = string | number>
  extends ModVersion {
  modId: `${Id}`;
}

export interface PlatformManagerDb extends Dexie {
  platformMods: EntityTable<PlatformModDbEntry, "id">;
  platformModVersions: EntityTable<PlatformModVersionDbEntry, "modId">;
}

//================================================

export interface DataRegistryDb extends Dexie, PlatformManagerDb {
  lastRefresh: number;
  mods: EntityTable<ModDbEntry, "id">;
}
