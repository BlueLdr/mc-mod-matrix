import type { Mod } from "@mcmm/data";
import type Immutable from "immutable";

//================================================

export interface AppDataState {
  allMods: Immutable.Map<string, Mod> | undefined;
}
