import type { GameVersion, Curseforge, ModLoader } from "./index";

//================================================

export interface CurseforgeModVersionDataRaw {
  id: number;
  modId: number;
  displayName: string;
  fileStatus: Curseforge.FileStatus;
  isAvailable: boolean;
  gameVersions: GameVersion[];
  loaders: ModLoader[];
}

export interface CurseforgeModMetadataRaw {
  id: number;
  slug: string;
  author: { name: string; username: string; id: number };
  name: string;
  summary: string;
  thumbnailUrl: string;
}
