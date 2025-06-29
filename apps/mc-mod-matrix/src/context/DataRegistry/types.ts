"use client";

import type { DataRegistry } from "~/data";

//================================================

export interface DataRegistryContextState {
  dataRegistry: DataRegistry | undefined;

  isRefreshing: boolean;

  worker: React.RefObject<Worker | null>;
}
