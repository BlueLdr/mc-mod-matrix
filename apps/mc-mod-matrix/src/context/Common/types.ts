import type { GameVersion, ModLoader } from "@mcmm/data";
import type { Curseforge } from "@mcmm/curseforge";

//================================================

export interface AppCommonState {
  gameVersions: GameVersion[];
  loaderVersions: Partial<
    Record<ModLoader, Record<GameVersion, Curseforge.MinecraftModLoaderIndex[]>>
  >;
  setLoaderVersions: (versions: Curseforge.MinecraftModLoaderIndex[]) => void;
}
