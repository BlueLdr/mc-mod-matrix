"use client";

import { createContext, useCallback, useEffect, useMemo, useRef, useState } from "react";

import { DataRegistry } from "~/data";
import { useRemotePromise } from "~/utils";

import type { WithChildren } from "@mcmm/types";
import type { DataRegistryContextState } from "./types";

//================================================

export const DataRegistryContext = createContext<DataRegistryContextState>({
  getDataRegistry: () => new Promise<DataRegistry>(() => undefined),
  dataRegistry: undefined,
  refreshProgress: undefined,
  clearRefreshProgress: () => undefined,
  worker: { current: null },
});

export function DataRegistryProvider({ children }: WithChildren) {
  const workerRef = useRef<Worker>(null);
  const [dataRegistry, setDataRegistry] = useState<DataRegistry>();
  const [refreshProgress, setRefreshProgress] =
    useState<DataRegistryContextState["refreshProgress"]>();
  const [promise, remoteRef] = useRemotePromise<DataRegistry>();
  useEffect(() => {
    const dataRegistry = new DataRegistry();
    setDataRegistry(dataRegistry);
    remoteRef.current?.resolve(dataRegistry);

    workerRef.current = new window.Worker("/workers/worker.js");
    workerRef.current.postMessage({ init: true });
    workerRef.current.addEventListener("message", e => {
      if (e.data.message) {
        console.log(`[DataRegistry Worker]`, e.data.message);
      }
      if ("progress" in e.data) {
        setRefreshProgress(e.data.progress);
      }
    });
    return () => workerRef.current?.terminate();
  }, [remoteRef]);

  const getDataRegistry = useCallback(() => promise, [promise]);

  const value = useMemo<DataRegistryContextState>(
    () => ({
      getDataRegistry,
      dataRegistry,
      refreshProgress,
      clearRefreshProgress: () => setRefreshProgress(undefined),
      worker: workerRef,
    }),
    [dataRegistry, refreshProgress, getDataRegistry],
  );

  return <DataRegistryContext.Provider value={value}>{children}</DataRegistryContext.Provider>;
}
