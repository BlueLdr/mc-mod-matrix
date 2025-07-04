"use client";

import { useLiveQuery } from "dexie-react-hooks";
import * as Immutable from "immutable";
import { createContext, useCallback, useContext, useEffect, useMemo, useRef } from "react";

import { DataRegistryContext, StorageContext } from "~/context";

import type { DataRegistry } from "~/data";
import type { WithChildren } from "@mcmm/types";
import type { AppDataState } from "./types";

//================================================

export const DataContext = createContext<AppDataState>({
  allMods: undefined,
});

const getAllMods = async (registry: DataRegistry) => {
  const allMods = (await registry?.helper.getAllMods()) ?? [];
  return Immutable.Map(allMods.map(mod => [mod.id, mod] as const));
};

//================================================

export const DataProvider: React.FC<WithChildren> = ({ children }) => {
  const { reloadStorage } = useContext(StorageContext);
  const { dataRegistry } = useContext(DataRegistryContext);
  const doQuery = useCallback(
    () => (dataRegistry ? getAllMods(dataRegistry) : undefined),
    [dataRegistry],
  );

  const allMods = useLiveQuery(doQuery, [doQuery, dataRegistry]);

  const prevValue = useRef(allMods);
  useEffect(() => {
    if (!prevValue.current && allMods) {
      reloadStorage();
    }
    prevValue.current = allMods;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allMods]);

  const value = useMemo<AppDataState>(
    () => ({
      allMods,
    }),
    [allMods],
  );

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};
