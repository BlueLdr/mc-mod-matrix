import type Dexie from "dexie";
import type { EntityTable } from "dexie";
import type { Mod, ModVersion, PlatformModMetadata, Platform } from "@mcmm/data";
import type { ExtraDataForPlatform } from "@mcmm/platform";

//================================================

export interface ModDbEntry extends Omit<Mod, "platforms" | "versions"> {
  platforms: string[];
}

//================================================

export interface PlatformModDbEntry<
  P extends Platform = Platform,
  Id extends string | number = string | number,
> {
  meta: PlatformModMetadata<P, Id>;
  id: string;
  extraData?: ExtraDataForPlatform<P>;
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
  mods: EntityTable<ModDbEntry, "id">;
}

//================================================

export interface BackgroundRefreshProgressData {
  total: number;
  current?: { index: number; name: string };
  complete: boolean;
  paused?: boolean;
  error?: Error;
}

//================================================

export interface DataRegistryExportedData {
  mods: ModDbEntry[];
  platformMods: PlatformModDbEntry[];
  platformModVersions: PlatformModVersionDbEntry[];
}
