import type { DataRegistry } from "~/data";
import type { StoredModpack } from "@mcmm/data";
import type { AppDataExport } from "./types";

//================================================

export const importData = async (
  data: AppDataExport,
  dataRegistry: DataRegistry,
  packs: StoredModpack[],
) => {
  await dataRegistry.importData(data.db);
  return data.packs;
};
