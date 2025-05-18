import { values } from "lodash";

import { ModLoader } from "./types";

import type { GameVersion, ModVersion, ModVersionData } from "./types";

//================================================

const loaderValues = values(ModLoader);
const isLoader = (value: GameVersion | ModVersion): value is ModLoader =>
  loaderValues.includes(value as ModLoader);

export class VersionSet<
  T extends ModVersion | ModVersionData = ModVersion,
> extends Array<T> {
  public get(param: GameVersion | ModLoader) {
    const key = isLoader(param) ? "loader" : "gameVersion";
    return new VersionSet<T>(...this.filter(v => v[key] === param));
  }

  public get gameVersions(): GameVersion[] {
    return Array.from(new Set(this.map(v => v.gameVersion)));
  }

  public get modLoaders() {
    return Array.from(new Set(this.map(v => v.loader)));
  }

  public push(version: T) {
    const existingVersions = this.get(version.gameVersion).get(version.loader);
    if (!existingVersions.some(e => e.platform === version.platform)) {
      return super.push(version);
    }
    return this.length;
  }

  public concat(...items: (T | ConcatArray<T>)[]): VersionSet<T> {
    const newSet = new VersionSet(...Array.from(this));
    items.forEach(itemOrArray => {
      if ("length" in itemOrArray) {
        itemOrArray.slice().forEach(item => newSet.push(item));
      } else {
        newSet.push(itemOrArray);
      }
    });
    return newSet;
  }
}
