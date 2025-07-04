"use client";

import { useContext, useMemo } from "react";

import { getPackSupportForConfig } from "@mcmm/data";
import { DataContext, useVersionRange } from "~/context";

import type { PackSupportMeta, Modpack } from "@mcmm/data";

//================================================

export const usePackSupportMetaList = (pack: Modpack) => {
  const {
    versions: { min: minVersion, max: maxVersion },
    loaders,
  } = pack;
  const versions = useVersionRange(minVersion, maxVersion);

  const { allMods } = useContext(DataContext);

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
