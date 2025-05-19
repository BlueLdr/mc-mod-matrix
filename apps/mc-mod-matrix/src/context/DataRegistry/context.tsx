"use client";

import { createContext, useEffect, useMemo, useState } from "react";

import { DataRegistry } from "~/data";

import type { WithChildren } from "@mcmm/types";
import type { DataRegistryMap } from "~/data";
import type { DataRegistryContextState } from "./types";

//================================================

export const DataRegistryContext = createContext<DataRegistryContextState>({
  data: [],
  getMod: () => undefined,
  storeMod: () => Promise.reject(),
  setModAlternatives: () => undefined,
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
      setModAlternatives: (mod, alternatives) => dataRegistry.setModAlternatives(mod, alternatives),
      forceRefresh: () => dataRegistry.forceRefresh(),
    }),
    [registryMap],
  );

  return <DataRegistryContext.Provider value={value}>{children}</DataRegistryContext.Provider>;
}
