"use client";

import type { GameVersion, Mod, ModMetadata } from "@mcmm/data";
import type { DataRegistry } from "~/data";

//================================================

export interface DataRegistryContextState {
  dataRegistry: DataRegistry | undefined;

  storeMod(meta: ModMetadata, minGameVersion: GameVersion): Promise<Mod | null>;

  setModAlternatives(mod: Mod, alternatives: string[]): Promise<number | undefined>;

  forceRefresh(): void;
}
