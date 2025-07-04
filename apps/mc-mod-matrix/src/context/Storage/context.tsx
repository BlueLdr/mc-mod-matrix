"use client";

import { useParams } from "next/navigation";
import { createContext, useCallback, useMemo } from "react";

import { loadStorage, useStorageState } from "~/utils";

import type { Modpack, StoredModpack } from "@mcmm/data";
import type { WithChildren } from "@mcmm/types";
import type { StoredDataState } from "./types";

//================================================

const STORAGE_KEY = "storage";

const storedList = loadStorage<StoredModpack[]>(STORAGE_KEY);

export const StorageContext = createContext<StoredDataState>({
  currentPack: undefined,
  packs: storedList,
  setPacks: () => undefined,
  addPack: () => undefined,
  removePack: () => undefined,
  updatePack: () => undefined,
  reloadStorage: () => undefined,
});

//================================================

export const StorageProvider: React.FC<WithChildren> = ({ children }) => {
  const { name: currentPackName } = useParams<{ name: string }>();
  const [packs, setPacks_, reloadStorage] = useStorageState(STORAGE_KEY, storedList);

  const setPacks = useCallback(
    (newState: React.SetStateAction<StoredModpack[]>) => {
      setPacks_((prevState = []) => {
        if (typeof newState === "function") {
          return newState(prevState);
        }
        return newState;
      });
    },
    [setPacks_],
  );

  const addPack = useCallback(
    (newPack: Modpack | StoredModpack) =>
      setPacks(prevState =>
        prevState.concat({
          ...newPack,
          mods: newPack.mods.map(mod => (typeof mod === "string" ? mod : mod.id)),
        }),
      ),
    [setPacks],
  );
  const removePack = useCallback(
    (name: string) => setPacks(prevState => prevState.filter(pack => pack.name !== name)),
    [setPacks],
  );

  const updatePack = useCallback(
    (newPack: Modpack | StoredModpack) =>
      setPacks(prevState =>
        prevState.map(pack =>
          pack.name === newPack.name
            ? {
                ...newPack,
                mods: newPack.mods.map(mod => (typeof mod === "string" ? mod : mod.id)),
              }
            : pack,
        ),
      ),
    [setPacks],
  );

  const value = useMemo(
    () => ({
      currentPack: packs?.find(p => p.name === decodeURIComponent(currentPackName ?? "")),
      packs,
      setPacks,
      addPack,
      removePack,
      updatePack,
      reloadStorage,
    }),
    [packs, reloadStorage, setPacks, addPack, removePack, updatePack, currentPackName],
  );

  return <StorageContext value={value}>{children}</StorageContext>;
};
