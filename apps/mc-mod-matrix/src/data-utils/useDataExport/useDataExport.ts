"use client";

import { useContext, useMemo } from "react";

import { CommonContext, DataContext, DataRegistryContext, StorageContext } from "~/context";
import { applyDataImport, prepareDataImport } from "~/data-utils/useDataExport/import-merge";

import { importData } from "./import-overwrite";

import type { AppDataExport, ImportPreview } from "./types";

//================================================

export const useDataExport = () => {
  const { dataRegistry } = useContext(DataRegistryContext);
  const { allMods } = useContext(DataContext);
  const { packs, setPacks } = useContext(StorageContext);
  const { gameVersions } = useContext(CommonContext);

  return useMemo(() => {
    if (!dataRegistry || !packs || !allMods) {
      return;
    }
    return {
      exportAllData: async () => ({
        db: await dataRegistry.exportData(),
        packs,
      }),
      resetAndImportData: async (data: AppDataExport) => {
        const updatedPacks = await importData(data, dataRegistry, packs);
        setPacks(updatedPacks);
      },
      prepareImportData: (data: AppDataExport) =>
        prepareDataImport(data, dataRegistry, packs, gameVersions),
      applyImportData: (importData: ImportPreview) => applyDataImport(importData, dataRegistry),
    };
  }, [allMods, dataRegistry, gameVersions, packs, setPacks]);
};
