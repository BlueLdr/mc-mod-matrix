import type { PlatformModMetadataCollection } from "./platform-collection";
import type { VersionSet } from "./version-set";

//================================================

export interface StoredModpack {
  name: string;
  mods: string[];
  versions: {
    min: GameVersion;
    max: GameVersion;
  };
  loaders: ModLoader[];
}

export interface Modpack {
  name: string;
  mods: Mod[];
  versions: {
    min: GameVersion;
    max: GameVersion;
  };
  loaders: ModLoader[];
  pinnedVersions?: Pick<ModVersion, "gameVersion" | "loader">[];
}

export interface Mod {
  id: string; // guid
  name: string;
  meta: ModMetadata;
  versions: VersionSet;
  alternatives?: Mod["id"][];
}

export interface ModVersion {
  gameVersion: GameVersion;
  loader: ModLoader;
  platform: Platform;
}

export type GameVersion = string;

export enum ModLoader {
  "Fabric" = "fabric",
  "NeoForge" = "neoforge",
  "Forge" = "forge",
  "Quilt" = "quilt",
}

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
}

export interface ModMetadata {
  name: string;
  image: string;
  platforms: PlatformModMetadataCollection;
}

export interface ModVersionData<PlatformMetaId extends string | number = string | number>
  extends ModVersion {
  id: PlatformMetaId;
  slug: string;
  image?: string;
}

export type ModVersionDataMap = Record<GameVersion, Partial<Record<ModLoader, ModVersionData>>>;

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
