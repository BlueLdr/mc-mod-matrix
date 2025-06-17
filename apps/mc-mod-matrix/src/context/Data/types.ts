import type { GameVersion, Modpack, StoredModpack } from "@mcmm/data";

//================================================

export interface StoredDataState {
  currentPack: Modpack | undefined;
  packs: Modpack[];
  setPacks: React.Dispatch<React.SetStateAction<StoredModpack[]>>;
  addPack: (pack: Modpack) => void;
  removePack: (name: string) => void;
  updatePack: (pack: Modpack) => void;
  gameVersions: GameVersion[];
}
