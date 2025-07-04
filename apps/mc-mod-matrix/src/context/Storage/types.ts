import type { Modpack, StoredModpack } from "@mcmm/data";

export interface StoredDataState {
  currentPack: StoredModpack | undefined;
  packs: StoredModpack[];
  setPacks: React.Dispatch<React.SetStateAction<StoredModpack[]>>;
  addPack: (pack: StoredModpack | Modpack) => void;
  removePack: (name: string) => void;
  updatePack: (pack: StoredModpack | Modpack) => void;
  reloadStorage: () => void;
}
