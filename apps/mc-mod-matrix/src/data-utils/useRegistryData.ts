"use client";

import { useLiveQuery } from "dexie-react-hooks";
import useSWR from "swr";
import { useCallback, useContext } from "react";

import { DataRegistryContext } from "~/context";

import type { DataRegistry } from "~/data";

//================================================

export interface UseRegistryData {
  <T>(querier: (registry: DataRegistry) => Promise<T> | T, deps?: any[]): T;

  <T, TDefault>(
    querier: (registry: DataRegistry) => Promise<T> | T,
    deps: any[],
    defaultResult: TDefault,
  ): T | TDefault;
}

export const useRegistryData: UseRegistryData = <T, TDefault>(
  query: (registry: DataRegistry) => Promise<T> | T,
  deps?: any[],
  defaultValue?: TDefault,
) => {
  const { getDataRegistry } = useContext(DataRegistryContext);

  const doQuery = useCallback(async () => {
    const dataRegistry = await getDataRegistry();
    return await query(dataRegistry);
  }, [query, getDataRegistry]);

  const queryResult = useLiveQuery(
    doQuery,
    [...(deps ?? []), getDataRegistry, query],
    defaultValue,
  );

  const { data } = useSWR(queryResult ? null : (deps ?? []), () => doQuery(), {
    suspense: true,
    keepPreviousData: true,
    fallbackData: undefined,
  });

  return queryResult ?? data;
};
