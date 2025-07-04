"use client";

import type { DataRefreshProgressData, DataRegistry } from "~/data";

//================================================

export interface DataRegistryContextState {
  getDataRegistry: () => Promise<DataRegistry>;

  dataRegistry: DataRegistry | undefined;

  refreshProgress?: DataRefreshProgressData;
  clearRefreshProgress: () => void;

  worker: React.RefObject<Worker | null>;
}
