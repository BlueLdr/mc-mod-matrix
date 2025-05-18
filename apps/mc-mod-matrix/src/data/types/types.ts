import type { VersionSet } from "../version-set";
import type { CurseforgeModMetadataRaw } from "./curseforge";
import type { ModrinthModMetadataRaw } from "./modrinth";

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
}

export interface Mod {
  name: string;
  meta: ModMetadata;
  versions: VersionSet;
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

export interface ModMetadata {
  slug: string;
  name: string;
  image: string;
  curseforge?: CurseforgeModMetadataRaw;
  modrinth?: ModrinthModMetadataRaw;
}

export interface ModVersionData extends ModVersion {
  id: string | number;
  slug: string;
  image: string;
}

export type ModVersionDataMap = Record<GameVersion, Partial<Record<ModLoader, ModVersionData>>>;

export interface PackSupportMeta {
  gameVersion: GameVersion;
  loader: ModLoader;
  pack: Modpack;
  supportedMods: Mod[];
  unsupportedMods: Mod[];
  percentage: number;
}
