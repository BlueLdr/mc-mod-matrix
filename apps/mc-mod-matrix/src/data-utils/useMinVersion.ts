"use client";

import { use, useContext } from "react";

import { DataContext } from "~/context";

import type { Mod } from "@mcmm/data";
import type { DataRegistry } from "~/data";

//================================================

export const useMinVersion = (mod: Mod | undefined, dataRegistry: DataRegistry) => {
  const { currentPack } = useContext(DataContext);

  if (currentPack) {
    return currentPack.versions.min;
  }
  if (mod) {
    const entry = use(dataRegistry.getModById(mod.id));
    if (entry) {
      return entry.minGameVersionFetched;
    }
  }

  return undefined;
};
