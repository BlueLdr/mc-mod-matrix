"use client";

import { createContext, useEffect, useMemo, useState } from "react";

import { DataRegistry, type DataRegistryMap } from "~/data";

import type { DataRegistryContextState } from "./types.ts";
import type { WithChildren } from "@mcmm/types";

//================================================

export const DataRegistryContext = createContext<DataRegistryContextState>({
  data: [],
  getMod: () => undefined,
  storeMod: () => Promise.reject(),
  forceRefresh: () => undefined,
});

const dataRegistry = new DataRegistry();

export function DataRegistryProvider({ children }: WithChildren) {
  const [registryMap, setRegistryMap] = useState<DataRegistryMap>(() => dataRegistry.registryData);

  useEffect(() => {
    dataRegistry.onRegistryChanged = setRegistryMap;
  }, []);

  const value = useMemo<DataRegistryContextState>(
    () => ({
      data: Array.from(registryMap?.values() ?? []),
      getMod: slugOrId => registryMap.get(slugOrId),
      storeMod: (meta, minGameVersion) => dataRegistry.storeMod(meta, minGameVersion),
      forceRefresh: () => dataRegistry.forceRefresh(),
    }),
    [registryMap],
  );

  return <DataRegistryContext.Provider value={value}>{children}</DataRegistryContext.Provider>;
}
