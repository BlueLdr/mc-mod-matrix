"use client";

import { use, useContext } from "react";

import { DataRegistryContext, StorageContext } from "~/context";

import type { Mod } from "@mcmm/data";

//================================================

export const useMinVersion = (mod: Mod | undefined) => {
  const { dataRegistry } = useContext(DataRegistryContext);
  const { currentPack } = useContext(StorageContext);

  if (currentPack) {
    return currentPack.versions.min;
  }
  if (mod && dataRegistry) {
    const entry = use(dataRegistry?.helper.getModById(mod.id));
    if (entry) {
      return entry.minGameVersionFetched;
    }
  }

  return undefined;
};
