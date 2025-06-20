"use client";

import { createContext, useEffect, useMemo, useRef, useState } from "react";

import { DataRegistry } from "~/data";

import type { WithChildren } from "@mcmm/types";
import type { DataRegistryContextState } from "./types";

//================================================

export const DataRegistryContext = createContext<DataRegistryContextState>({
  dataRegistry: undefined,
  isRefreshing: false,
  worker: { current: null },
});

export function DataRegistryProvider({ children }: WithChildren) {
  const workerRef = useRef<Worker>(null);
  const [dataRegistry, setDataRegistry] = useState<DataRegistry>();
  const [isRefreshing, setIsRefreshing] = useState(false);
  useEffect(() => {
    const dataRegistry = new DataRegistry();
    setDataRegistry(dataRegistry);

    workerRef.current = new window.Worker("/workers/worker.js");
    workerRef.current.postMessage({ init: true });
    workerRef.current.addEventListener("message", e => {
      console.log(`[DataRegistry Worker]`, e.data.message);
      if ("inProgress" in e.data) {
        setIsRefreshing(!!e.data.inProgress);
      }
    });
    return () => workerRef.current?.terminate();
  }, []);
  const value = useMemo<DataRegistryContextState>(
    () => ({
      dataRegistry,
      isRefreshing,
      worker: workerRef,
    }),
    [dataRegistry, isRefreshing],
  );

  return <DataRegistryContext.Provider value={value}>{children}</DataRegistryContext.Provider>;
}
