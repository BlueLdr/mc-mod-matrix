"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

import { StorageContext } from "~/context";
import { DataRegistry, DataRegistryWorkerApi } from "~/data";
import { useRemotePromise } from "~/utils";

import type { WithChildren } from "@mcmm/types";
import type { DataRegistryContextState } from "./types";

//================================================

export const DataRegistryContext = createContext<DataRegistryContextState>({
  getDataRegistry: () => new Promise<DataRegistry>(() => undefined),
  dataRegistry: undefined,
  workerApi: undefined,
});

export function DataRegistryProvider({ children }: WithChildren) {
  const [workerApi, setWorkerApi] = useState<DataRegistryWorkerApi>();
  const [dataRegistry, setDataRegistry] = useState<DataRegistry>();
  const [promise, remoteRef] = useRemotePromise<DataRegistry>();
  const { commonMods } = useContext(StorageContext);
  useEffect(() => {
    const dataRegistry = new DataRegistry();
    setDataRegistry(dataRegistry);
    remoteRef.current?.resolve(dataRegistry);

    const workerApi = new DataRegistryWorkerApi(commonMods);
    setWorkerApi(workerApi);

    if ("window" in global && process.env.NODE_ENV?.startsWith("dev")) {
      // @ts-expect-error: for debugging
      window["dataRegistry"] = dataRegistry;
    }

    return () => workerApi.terminate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [remoteRef]);

  useEffect(() => {
    workerApi?.sendRequest({ type: "update-common-mods", modsToAutoRefresh: commonMods });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [commonMods]);

  const getDataRegistry = useCallback(() => promise, [promise]);

  const value = useMemo<DataRegistryContextState>(
    () => ({
      getDataRegistry,
      dataRegistry,
      workerApi,
    }),
    [getDataRegistry, dataRegistry, workerApi],
  );

  return <DataRegistryContext.Provider value={value}>{children}</DataRegistryContext.Provider>;
}
