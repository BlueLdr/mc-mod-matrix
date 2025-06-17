"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useParams } from "next/navigation";

import { modrinthApi } from "@mcmm/modrinth";
import { gameVersionComparator } from "@mcmm/utils";
import { useAllModsMap } from "~/data-utils";
import { loadStorage, useStorageState } from "~/utils";

import type { WithChildren } from "@mcmm/types";
import type { GameVersion, Modpack, StoredModpack } from "@mcmm/data";
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
  const allMods = useAllModsMap();
  const [_packs, setPacks, reloadStorage] = useStorageState(STORAGE_KEY, storedList);
  const { name: currentPackName } = useParams<{ name: string }>();

  const prevValue = useRef(allMods);
  useEffect(() => {
    if (!prevValue.current && allMods) {
      reloadStorage();
    }
    prevValue.current = allMods;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allMods]);

  const addPack = useCallback(
    (newPack: Modpack) =>
      setPacks(prevState =>
        prevState.concat({
          ...newPack,
          mods: newPack.mods.map(mod => mod.id),
        }),
      ),
    [setPacks],
  );
  const removePack = useCallback(
    (name: string) => setPacks(prevState => prevState.filter(pack => pack.name !== name)),
    [setPacks],
  );
  const updatePack = useCallback(
    (newPack: Modpack) =>
      setPacks(prevState =>
        prevState.map(pack =>
          pack.name === newPack.name
            ? {
                ...newPack,
                mods: newPack.mods.map(mod => mod.id),
              }
            : pack,
        ),
      ),
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

  const packs = useMemo(
    () =>
      _packs.map<Modpack>(pack => ({
        ...pack,
        mods: allMods ? pack.mods.map(id => allMods.get(id)).filter(m => !!m) : [],
      })),
    [_packs, allMods],
  );

  const _currentPack = packs.find(p => p.name === decodeURIComponent(currentPackName ?? ""));
  const currentPackEquality = JSON.stringify(_currentPack);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const currentPack = useMemo(() => _currentPack, [currentPackEquality]);

  const value = useMemo<StoredDataState>(() => {
    return {
      currentPack,
      packs,
      setPacks,
      addPack,
      removePack,
      updatePack,
      gameVersions,
    };
  }, [currentPack, packs, setPacks, addPack, removePack, updatePack, gameVersions]);

  return (
    <DataContext.Provider value={value}>{!allMods ? "Loading..." : children}</DataContext.Provider>
  );
};
