import { useContext, useMemo } from "react";

import { DataContext, StorageContext } from "~/context";

import type { Modpack, StoredModpack } from "@mcmm/data";

//================================================

export const useAllModsMap = () => useContext(DataContext).allMods;

//================================================

export const useModFromId = (modId: string) => {
  const allMods = useAllModsMap();
  return allMods?.get(modId);
};

export const useModsFromIds = (modIds: string[]) => {
  const allMods = useAllModsMap();
  const modIdsEquality = useMemo(() => JSON.stringify(modIds.slice().sort()), [modIds]);
  return useMemo(
    () => modIds.map(id => allMods?.get(id)).filter(mod => !!mod),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [modIdsEquality],
  );
};

//================================================

const empty: string[] = [];

export interface UseStoredPackWithData {
  (storedModpack: StoredModpack): Modpack;

  (storedModpack: StoredModpack | undefined): Modpack | undefined;
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
