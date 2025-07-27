"use client";

import { useParams } from "next/navigation";
import { createContext, useCallback, useEffect, useMemo } from "react";
import { v4 as uuid } from "uuid";

import { loadStorage, setStorage, useStorageState } from "~/utils";

import type { Mod, Modpack, StoredModpack } from "@mcmm/data";
import type { WithChildren } from "@mcmm/types";
import type { StoredDataState } from "./types";

//================================================

const PACKS_STORAGE_KEY = "storage";
const COMMON_MODS_STORAGE_KEY = "common-mods";

const storedListRaw = loadStorage<StoredModpack[]>(PACKS_STORAGE_KEY);
let storedList: StoredModpack[] | undefined = storedListRaw;
try {
  let shouldUpdateStorage = false;
  storedList = storedListRaw?.map(pack => {
    if (!pack.id) {
      shouldUpdateStorage = true;
      return { ...pack, id: uuid() };
    }
    return pack;
  });
  if (shouldUpdateStorage) {
    setStorage(PACKS_STORAGE_KEY, storedList);
  }
} catch (e) {
  console.error("Failed to add ids to pack list", e);
}

const storedCommonMods = loadStorage<Mod["id"][]>(COMMON_MODS_STORAGE_KEY, []);

export const StorageContext = createContext<StoredDataState>({
  currentPack: undefined,
  packs: storedList,
  setPacks: () => undefined,
  addPack: () => "",
  removePack: () => undefined,
  updatePack: () => undefined,
  reloadStorage: () => undefined,
  commonMods: storedCommonMods,
  setCommonMods: () => undefined,
});

//================================================

export const StorageProvider: React.FC<WithChildren> = ({ children }) => {
  const { id: currentPackId } = useParams<{ id: string }>();
  const [packs, setPacks_, reloadStorage] = useStorageState(PACKS_STORAGE_KEY, storedList);
  const [commonMods, setCommonMods] = useStorageState(COMMON_MODS_STORAGE_KEY, storedCommonMods);

  useEffect(() => {
    if (!packs) {
      const existingData = localStorage.getItem(PACKS_STORAGE_KEY);
      if (existingData) {
        localStorage.setItem(`${PACKS_STORAGE_KEY}-backup-${Date.now()}`, existingData);
      }
      setPacks([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
    (newPack: Omit<Modpack | StoredModpack, "id">) => {
      const newId = uuid();
      setPacks(prevState =>
        prevState.concat({
          ...newPack,
          id: newId,
          mods: newPack.mods.map(mod => (typeof mod === "string" ? mod : mod.id)),
        }),
      );
      return newId;
    },
    [setPacks],
  );
  const removePack = useCallback(
    (id: string) => setPacks(prevState => prevState.filter(pack => pack.id !== id)),
    [setPacks],
  );

  const updatePack = useCallback(
    (newPack: Modpack | StoredModpack) =>
      setPacks(prevState =>
        prevState.map(pack =>
          pack.id === newPack.id
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
      currentPack: packs?.find(p => p.id === decodeURIComponent(currentPackId ?? "")),
      packs,
      setPacks,
      addPack,
      removePack,
      updatePack,
      reloadStorage,
      commonMods,
      setCommonMods,
    }),
    [
      packs,
      setPacks,
      addPack,
      removePack,
      updatePack,
      reloadStorage,
      commonMods,
      setCommonMods,
      currentPackId,
    ],
  );

  return <StorageContext value={value}>{children}</StorageContext>;
};
