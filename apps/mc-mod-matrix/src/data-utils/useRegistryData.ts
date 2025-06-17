import { useLiveQuery } from "dexie-react-hooks";
import * as Immutable from "immutable";
import { useCallback, useContext } from "react";

import { DataRegistryContext } from "~/context";

import type { DataRegistry } from "~/data";

//================================================

export interface UseRegistryData {
  <T>(querier: (registry: DataRegistry) => Promise<T> | T, deps?: any[]): T | undefined;

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
  const { dataRegistry } = useContext(DataRegistryContext);

  const doQuery = useCallback(() => query(dataRegistry), [dataRegistry, query]);

  return useLiveQuery(doQuery, deps ?? [], defaultValue);
};

//================================================

const getAllMods = async (registry: DataRegistry) => {
  const allMods = await registry.getAllMods();
  return Immutable.Map(allMods.map(mod => [mod.modId, mod.data] as const));
};

export const useAllModsMap = () => useRegistryData(getAllMods);
