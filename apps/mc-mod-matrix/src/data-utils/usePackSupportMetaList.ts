"use client";

import { useContext, useMemo } from "react";

import { getPackSupportForConfig } from "@mcmm/data";
import { gameVersionComparator } from "@mcmm/utils";
import { DataContext } from "~/context";

import { useAllModsMap } from "./useRegistryData";

import type { PackSupportMeta, Modpack } from "@mcmm/data";

//================================================

export const usePackSupportMetaList = (pack: Modpack) => {
  const {
    versions: { min: minVersion, max: maxVersion },
    loaders,
  } = pack;
  const { gameVersions } = useContext(DataContext);
  const versions = useMemo(
    () =>
      gameVersions.filter(
        ver =>
          gameVersionComparator(ver, maxVersion) <= 0 &&
          gameVersionComparator(ver, minVersion) >= 0,
      ),
    [gameVersions, minVersion, maxVersion],
  );

  const allMods = useAllModsMap();

  return useMemo(
    () =>
      // rows first
      loaders.reduce(
        (arr, loader) => [
          ...arr,
          ...versions.map(gameVersion =>
            getPackSupportForConfig(pack, gameVersion, loader, modId => allMods?.get(modId)),
          ),
        ],
        [] as PackSupportMeta[],
      ),
    [loaders, versions, pack, allMods],
  );
};
