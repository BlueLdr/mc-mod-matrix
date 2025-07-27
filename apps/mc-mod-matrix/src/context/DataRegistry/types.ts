"use client";

import type { DataRegistry, DataRegistryWorkerApi } from "~/data";

//================================================

export interface DataRegistryContextState {
  getDataRegistry: () => Promise<DataRegistry>;

  dataRegistry: DataRegistry | undefined;

  workerApi: DataRegistryWorkerApi | undefined;
}
