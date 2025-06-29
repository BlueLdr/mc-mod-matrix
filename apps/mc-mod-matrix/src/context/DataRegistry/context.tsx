"use client";

import { createContext, useMemo } from "react";

import { DataRegistry } from "~/data";

import type { WithChildren } from "@mcmm/types";
import type { DataRegistryContextState } from "./types";

//================================================

const dataRegistry = new DataRegistry();

export const DataRegistryContext = createContext<DataRegistryContextState>({
  dataRegistry: dataRegistry,
  storeMod: () => Promise.reject(),
  setModAlternatives: () => Promise.reject("Uninitialized"),
  forceRefresh: () => undefined,
});

export function DataRegistryProvider({ children }: WithChildren) {
  const value = useMemo<DataRegistryContextState>(
    () => ({
      dataRegistry: dataRegistry,
      storeMod: (meta, minGameVersion) => dataRegistry.storeMod(meta, minGameVersion),
      setModAlternatives: (mod, alternatives) => dataRegistry.setModAlternatives(mod, alternatives),
      forceRefresh: () => dataRegistry.forceRefresh(),
    }),
    [],
  );

  return <DataRegistryContext.Provider value={value}>{children}</DataRegistryContext.Provider>;
}
