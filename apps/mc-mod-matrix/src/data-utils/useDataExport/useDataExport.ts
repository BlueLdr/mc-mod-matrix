"use client";

import { useContext, useMemo } from "react";

import { DataContext, DataRegistryContext, StorageContext } from "~/context";

import { importData } from "./import-overwrite";

import type { AppDataExport } from "./types";

//================================================

export const useDataExport = () => {
  const { dataRegistry } = useContext(DataRegistryContext);
  const { allMods } = useContext(DataContext);
  const { packs, setPacks } = useContext(StorageContext);

  return useMemo(() => {
    if (!dataRegistry || !packs || !allMods) {
      return;
    }
    return {
      exportData: async () => ({
        db: await dataRegistry.exportData(),
        packs,
      }),
      importData: async (data: AppDataExport) => {
        const updatedPacks = await importData(data, dataRegistry, packs);
        setPacks(updatedPacks);
      },
    };
  }, [allMods, dataRegistry, packs, setPacks]);
};
