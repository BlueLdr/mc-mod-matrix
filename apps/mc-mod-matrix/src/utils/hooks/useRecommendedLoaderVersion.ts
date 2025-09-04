"use client";

import { useContext, useMemo } from "react";

import { comparator } from "@mcmm/utils";
import { CommonContext } from "~/context";

import type { GameVersion, ModLoader } from "@mcmm/data";

//================================================

export const useRecommendedLoaderVersion = (gameVersion: GameVersion, loader: ModLoader) => {
  const { loaderVersions } = useContext(CommonContext);
  return useMemo(() => {
    const sortedVersions = loaderVersions[loader]?.[gameVersion]
      ?.slice()
      ?.sort(comparator("desc", v => new Date(v.dateModified).getTime()));

    return sortedVersions?.find(v => v.recommended) ?? sortedVersions?.[0];
  }, [gameVersion, loader, loaderVersions]);
};
