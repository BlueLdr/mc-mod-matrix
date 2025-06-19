"use client";

import { createContext, useLayoutEffect, useMemo, useState } from "react";

import { DataRegistry } from "~/data";

import type { WithChildren } from "@mcmm/types";
import type { DataRegistryContextState } from "./types";

//================================================

export const DataRegistryContext = createContext<DataRegistryContextState>({
  dataRegistry: undefined,
  storeMod: () => Promise.reject(),
  setModAlternatives: () => Promise.reject("Uninitialized"),
  forceRefresh: () => undefined,
});

export function DataRegistryProvider({ children }: WithChildren) {
  const [dataRegistry, setDataRegistry] = useState<DataRegistry>();
  useLayoutEffect(() => {
    setDataRegistry(new DataRegistry());
  }, []);
  const value = useMemo<DataRegistryContextState>(
    () => ({
      dataRegistry: dataRegistry,
      storeMod: (meta, minGameVersion) =>
        dataRegistry?.storeMod(meta, minGameVersion) ?? Promise.reject(),
      setModAlternatives: (mod, alternatives) =>
        dataRegistry?.setModAlternatives(mod, alternatives) ?? Promise.reject(),
      forceRefresh: () => dataRegistry?.forceRefresh(),
    }),
    [dataRegistry],
  );

  return <DataRegistryContext.Provider value={value}>{children}</DataRegistryContext.Provider>;
}
