import type { Modpack } from "~/data";

export interface StoredDataState {
  list: Omit<Map<string, Modpack>, "add" | "delete" | "clear">;
  add(value: Modpack): void;
  remove(key: string | Modpack): void;
}
