"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";

import { curseforgeApi, modrinthApi } from "@mcmm/api";
import { gameVersionComparator } from "@mcmm/utils";
import { DataRegistryContext } from "~/context";
import { loadStorage, useStorageState } from "~/utils";

import type { WithChildren } from "@mcmm/types";
import type { GameVersion, Modpack, StoredModpack } from "@mcmm/data";
import type { UseStorageStateTransformer } from "~/utils";
import type { StoredDataState } from "./types";

//================================================

const STORAGE_KEY = "storage";

const storedList = loadStorage(STORAGE_KEY, [] as StoredModpack[]);

export const DataContext = createContext<StoredDataState>({
  currentPack: undefined,
  packs: [],
  setPacks: () => {},
  addPack: () => {},
  removePack: () => {},
  updatePack: () => {},
  gameVersions: [],
});

export const useVersionRange = (min: GameVersion, max: GameVersion) => {
  const { gameVersions } = useContext(DataContext);
  return useMemo(
    () =>
      gameVersions.filter(
        version =>
          gameVersionComparator(version, max) <= 0 && gameVersionComparator(version, min) >= 0,
      ),

    [gameVersions, min, max],
  );
};

//================================================

export const DataProvider: React.FC<WithChildren> = ({ children }) => {
  const { getMod } = useContext(DataRegistryContext);
  const transform = useMemo<UseStorageStateTransformer<StoredModpack[], Modpack[]>>(
    () => ({
      to: packs =>
        packs.map(pack => ({
          ...pack,
          mods: pack.mods.map(mod => mod.meta.slug),
        })),
      from: packs =>
        packs.map(pack => ({
          ...pack,
          mods: pack.mods.map(slug => getMod(slug)).filter(i => !!i),
        })),
    }),
    [getMod],
  );
  const [packs, setPacks] = useStorageState(STORAGE_KEY, storedList, transform);
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
    modrinthApi.getGameVersions().then(({ data }) => {
      if (data) {
        setGameVersions(
          data
            .filter(item => item.version_type === "release")
            .map(item => item.version as GameVersion),
        );
      }
    });
    // curseforgeApi.getVersionTypes();
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
