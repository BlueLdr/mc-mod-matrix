"use client";

import type { DataRegistry } from "~/data";

//================================================

export interface DataRegistryContextState {
  getDataRegistry: () => Promise<DataRegistry>;

  dataRegistry: DataRegistry | undefined;

  isRefreshing: boolean;

  worker: React.RefObject<Worker | null>;
}
