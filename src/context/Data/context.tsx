"use client";

import { createContext, useCallback, useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";

import { loadStorage, useStorageState } from "~/utils";

import type { WithChildren } from "~/utils";
import type { GameVersion, Modpack } from "~/data";
import type { StoredDataState } from "./types";
import { curseforgeApi, modrinthApi } from "~/api";

//================================================

const STORAGE_KEY = "storage";

const storedList = loadStorage(STORAGE_KEY, [] as Modpack[]);

export const DataContext = createContext<StoredDataState>({
  currentPack: undefined,
  packs: storedList,
  setPacks: () => {},
  addPack: () => {},
  removePack: () => {},
  updatePack: () => {},
  gameVersions: [],
});

//================================================

export const DataProvider: React.FC<WithChildren> = ({ children }) => {
  const [packs, setPacks] = useStorageState(STORAGE_KEY, storedList);
  const { name: currentPackName } = useParams<{ name: string }>();

  const addPack = useCallback(
    (newPack: Modpack) => setPacks(prevState => prevState.concat(newPack)),
    [setPacks],
  );
  const removePack = useCallback(
    (name: string) => setPacks(prevState => prevState.filter(pack => pack.name !== name)),
    [setPacks],
  );
  const updatePack = useCallback(
    (newPack: Modpack) =>
      setPacks(prevState => prevState.map(pack => (pack.name === newPack.name ? newPack : pack))),
    [setPacks],
  );

  const [gameVersions, setGameVersions] = useState<GameVersion[]>([]);
  useEffect(() => {
    modrinthApi.getGameVersions().then(setGameVersions);
    curseforgeApi.getVersionTypes();
  }, []);

  const value = useMemo<StoredDataState>(
    () => ({
      currentPack: packs.find(p => p.name === decodeURIComponent(currentPackName ?? "")),
      packs,
      setPacks,
      addPack,
      removePack,
      updatePack,
      gameVersions,
    }),
    [packs, setPacks, addPack, removePack, updatePack, gameVersions, currentPackName],
  );

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};
