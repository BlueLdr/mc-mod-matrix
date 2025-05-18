import type { GameVersion, Modpack } from "@mcmm/data";

//================================================

export interface StoredDataState {
  currentPack: Modpack | undefined;
  packs: Modpack[];
  setPacks: React.Dispatch<React.SetStateAction<Modpack[]>>;
  addPack: (pack: Modpack) => void;
  removePack: (name: string) => void;
  updatePack: (pack: Modpack) => void;
  gameVersions: GameVersion[];
}
