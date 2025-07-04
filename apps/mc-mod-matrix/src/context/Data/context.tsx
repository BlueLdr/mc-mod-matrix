"use client";

import { createContext, useContext, useEffect, useMemo, useRef } from "react";

import { StorageContext } from "~/context";
import { useAllModsMap } from "~/data-utils";

import type { WithChildren } from "@mcmm/types";
import type { AppDataState } from "./types";

//================================================

export const DataContext = createContext<AppDataState>({
  allMods: undefined,
});

//================================================

export const DataProvider: React.FC<WithChildren> = ({ children }) => {
  const allMods = useAllModsMap();
  const { reloadStorage } = useContext(StorageContext);

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
