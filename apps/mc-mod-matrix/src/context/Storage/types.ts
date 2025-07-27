import type { Mod, Modpack, StoredModpack } from "@mcmm/data";

export interface StoredDataState {
  currentPack: StoredModpack | undefined;
  packs: StoredModpack[] | undefined;
  setPacks: React.Dispatch<React.SetStateAction<StoredModpack[]>>;
  addPack: (pack: Omit<StoredModpack | Modpack, "id">) => string;
  removePack: (id: string) => void;
  updatePack: (pack: StoredModpack | Modpack) => void;
  reloadStorage: () => void;

  commonMods: Mod["id"][];
  setCommonMods: React.Dispatch<React.SetStateAction<Mod["id"][]>>;
}
