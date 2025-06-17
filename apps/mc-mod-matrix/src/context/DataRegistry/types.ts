import type { GameVersion, Mod, ModMetadata } from "@mcmm/data";
import type { DataRegistry } from "~/data";

//================================================

export interface DataRegistryContextState {
  dataRegistry: DataRegistry;

  storeMod(meta: ModMetadata, minGameVersion: GameVersion): Promise<Mod | null>;

  setModAlternatives(mod: Mod, alternatives: string[]): void;

  forceRefresh(): void;
}
