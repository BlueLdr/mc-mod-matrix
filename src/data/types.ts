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
  urls: string[];
  versions: ModVersion[];
}

export interface ModVersion {
  gameVersion: GameVersion;
  loader: ModLoader;
}

export type GameVersion = string;

export enum ModLoader {
  "Fabric" = "fabric",
  "NeoForge" = "neoforge",
  "Forge" = "forge",
  "Quilt" = "quilt",
}

export interface CurseforgeModDataRaw {
  id: number;
  slug: string;
  author: { name: string; username: string; id: number };
  name: string;
  summary: string;
  thumbnailUrl: string;
}

export interface ModrinthModDataRaw {
  project_id: string;
  slug: string;
  author: string;
  title: string;
  description: string;
  icon_url: string;
}

export interface ModMetadata {
  slug: string;
  name: string;
  image: string;
  curseforge?: CurseforgeModDataRaw;
  modrinth?: ModrinthModDataRaw;
}
