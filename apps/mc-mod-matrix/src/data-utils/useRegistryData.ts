"use client";

import { useLiveQuery } from "dexie-react-hooks";
import * as Immutable from "immutable";
import { useCallback, useContext, useMemo } from "react";

import { DataRegistryContext, StorageContext } from "~/context";

import type { Modpack, StoredModpack } from "@mcmm/data";
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

  const doQuery = useCallback(
    () => (dataRegistry ? query(dataRegistry) : new Promise<T>(() => undefined)),
    [dataRegistry, query],
  );

  return useLiveQuery(doQuery, [...(deps ?? []), dataRegistry, query], defaultValue);
};

//================================================

const getAllMods = async (registry: DataRegistry) => {
  const allMods = (await registry?.helper.getAllMods()) ?? [];
  return Immutable.Map(allMods.map(mod => [mod.id, mod] as const));
};

export const useAllModsMap = () => useRegistryData(getAllMods);

//================================================

export const useModFromId = (modId: string) => {
  const getModById = useCallback(
    async (registry: DataRegistry) => registry.helper.getModById(modId),
    [modId],
  );
  return useRegistryData(getModById, [modId]);
};

export const useModsFromIds = (modIds: string[]) => {
  const modIdsEquality = useMemo(() => JSON.stringify(modIds.slice().sort()), [modIds]);
  const getModById = useCallback(
    async (registry: DataRegistry) => registry.helper.getModsByIds(modIds),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [modIdsEquality],
  );
  return useRegistryData(getModById, [modIdsEquality]);
};

//================================================

const empty: string[] = [];

export interface UseStoredPackWithData {
  (storedModpack: StoredModpack): Modpack | (Omit<Modpack, "mods"> & { mods: undefined });

  (
    storedModpack: StoredModpack | undefined,
  ): Modpack | (Omit<Modpack, "mods"> & { mods: undefined }) | undefined;
}

export const useStoredPackWithData = (storedModpack => {
  const mods = useModsFromIds(storedModpack?.mods ?? empty);
  if (!storedModpack) {
    return;
  }
  return {
    ...storedModpack,
    mods,
  } as Modpack;
}) as UseStoredPackWithData;

export const useCurrentPackWithData = () => {
  const { currentPack } = useContext(StorageContext);
  return useStoredPackWithData(currentPack);
};
