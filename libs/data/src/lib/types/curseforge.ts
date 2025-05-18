import type { Curseforge } from "@mcmm/curseforge";
import type { GameVersion, ModLoader } from "./index";

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
  author: { name: string; id: number };
  name: string;
  summary: string;
  thumbnailUrl: string;
}
