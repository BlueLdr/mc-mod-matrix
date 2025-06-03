"use client";

import { useContext, useMemo } from "react";

import { getPackSupportForConfig } from "@mcmm/data";
import { gameVersionComparator } from "@mcmm/utils";
import { DataContext, DataRegistryContext } from "~/context";

import type { PackSupportMeta, Modpack } from "@mcmm/data";

//================================================

export const usePackSupportMetaList = (pack: Modpack) => {
  const {
    versions: { min: minVersion, max: maxVersion },
    loaders,
  } = pack;
  const { gameVersions } = useContext(DataContext);
  const { getMod } = useContext(DataRegistryContext);
  const versions = useMemo(
    () =>
      gameVersions.filter(
        ver =>
          gameVersionComparator(ver, maxVersion) <= 0 &&
          gameVersionComparator(ver, minVersion) >= 0,
      ),
    [gameVersions, minVersion, maxVersion],
  );

  return useMemo(
    () =>
      // rows first
      loaders.reduce(
        (arr, loader) => [
          ...arr,
          ...versions.map(gameVersion =>
            getPackSupportForConfig(pack, gameVersion, loader, getMod),
          ),
        ],
        [] as PackSupportMeta[],
      ),
    [loaders, versions, pack, getMod],
  );
};
