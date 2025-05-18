import type { GameVersion, Mod, ModMetadata, ModLoader } from "@mcmm/data";

//================================================

export interface DataRegistryContextState {
  data: Mod[];

  getMod(slugOrId: string | number): Mod | undefined;

  storeMod(meta: ModMetadata, minGameVersion: GameVersion): Promise<Mod | null>;

  forceRefresh(): void;
}
