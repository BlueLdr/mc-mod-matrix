import type { StoredModpack } from "@mcmm/data";
import type { DataRegistryExportedData } from "~/data";

//================================================

export interface AppDataExport {
  db: DataRegistryExportedData;
  packs: StoredModpack[];
}
