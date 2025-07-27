import type { Modpack, StoredModpack } from "@mcmm/data";

export interface StoredDataState {
  currentPack: StoredModpack | undefined;
  packs: StoredModpack[] | undefined;
  setPacks: React.Dispatch<React.SetStateAction<StoredModpack[]>>;
  addPack: (pack: Omit<StoredModpack | Modpack, "id">) => string;
  removePack: (name: string) => void;
  updatePack: (pack: StoredModpack | Modpack) => void;
  reloadStorage: () => void;
}
