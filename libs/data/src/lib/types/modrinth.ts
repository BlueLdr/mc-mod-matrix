import type { Modrinth } from "@mcmm/modrinth";
import type { GameVersion, ModLoader } from "./index";

//================================================

export interface ModrinthModVersionDataRaw {
  project_id: string;
  name: string;
  version_number: string;
  game_versions: GameVersion[];
  loaders: ModLoader[];
  status: Modrinth.ProjectStatus;
}

export interface ModrinthModMetadataRaw {
  project_id: string;
  slug: string;
  author: string;
  title: string;
  description: string;
  icon_url?: string;
}
