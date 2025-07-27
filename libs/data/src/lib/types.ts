import type { VersionSet } from "./version-set";
import type { PlatformModMetadataCollection } from "./platform-collection";

//================== VERSIONS ====================

export type GameVersion = string;

export enum ModLoader {
  "Fabric" = "fabric",
  "NeoForge" = "neoforge",
  "Forge" = "forge",
  "Quilt" = "quilt",
}

export interface PlatformModVersion {
  gameVersion: GameVersion;
  loader: ModLoader;
}

export interface ModVersion extends PlatformModVersion {
  platform: Platform;
}

//=================== PLATFORMS =================

export enum Platform {
  "Modrinth" = "Modrinth",
  "Curseforge" = "Curseforge",
}

export interface PlatformModMetadata<Id extends string | number = string | number> {
  platform: Platform;
  id: Id;
  slug: string;
  authorName: string;
  authorId: Id;
  modName: string;
  modDescription: string;
  thumbnailUrl: string;
  lastUpdated?: number;
  minGameVersionFetched?: GameVersion;
}

//==================== MODS ======================

export interface ModMetadata {
  name: string;
  image: string;
  platforms: PlatformModMetadataCollection;
  // platforms: PlatformModMetadata[];
  minGameVersionFetched: GameVersion | undefined;
}

export interface Mod extends ModMetadata {
  id: string;
  alternatives: Mod["id"][];
  versions: VersionSet;
}

//==================== PACKS =====================

export interface Modpack {
  id: string;
  name: string;
  mods: Mod[];
  versions: {
    min: GameVersion;
    max: GameVersion;
  };
  loaders: ModLoader[];
  pinnedVersions?: PlatformModVersion[];
}

export interface StoredModpack extends Omit<Modpack, "mods"> {
  mods: Mod["id"][];
}

export interface PackSupportMeta {
  gameVersion: GameVersion;
  loader: ModLoader;
  pack: Modpack;
  supportedMods: Mod[];
  unsupportedMods: Mod[];
  supportedAlternativeMods: Mod[];
  percentage: number;
  percentageWithAlternatives: number;
}

//================================================

export type MigrationMap = {
  PlatformModMetadata: PlatformModMetadata;
  ModMetadata: ModMetadata;
  Mod: Mod;
};
