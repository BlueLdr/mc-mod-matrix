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
  isRefreshing: false,
  worker: { current: null },
});

export function DataRegistryProvider({ children }: WithChildren) {
  const workerRef = useRef<Worker>(null);
  const [dataRegistry, setDataRegistry] = useState<DataRegistry>();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [promise, remoteRef] = useRemotePromise<DataRegistry>();
  useEffect(() => {
    const dataRegistry = new DataRegistry();
    setDataRegistry(dataRegistry);
    remoteRef.current?.resolve(dataRegistry);

    workerRef.current = new window.Worker("/workers/worker.js");
    workerRef.current.postMessage({ init: true });
    workerRef.current.addEventListener("message", e => {
      console.log(`[DataRegistry Worker]`, e.data.message);
      if ("inProgress" in e.data) {
        setIsRefreshing(!!e.data.inProgress);
      }
    });
    return () => workerRef.current?.terminate();
  }, [remoteRef]);

  const getDataRegistry = useCallback(() => promise, [promise]);

  const value = useMemo<DataRegistryContextState>(
    () => ({
      getDataRegistry,
      dataRegistry,
      isRefreshing,
      worker: workerRef,
    }),
    [dataRegistry, isRefreshing, getDataRegistry],
  );

  return <DataRegistryContext.Provider value={value}>{children}</DataRegistryContext.Provider>;
}
