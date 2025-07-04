import { values } from "lodash";

import { ModLoader } from "../lib/types";

import type { GameVersion, ModVersion } from "../lib/types";

//================================================

const loaderValues = values(ModLoader);
const isLoader = (value: GameVersion | ModVersion): value is ModLoader =>
  loaderValues.includes(value as ModLoader);

export class VersionSet<T extends ModVersion = ModVersion> extends Array<T> {
  constructor(set: VersionSet<T>);
  constructor(...items: T[]);
  constructor(first: VersionSet<T> | T, ...rest: T[]) {
    if (first instanceof VersionSet) {
      super(...first);
    } else {
      super(first, ...rest);
    }
  }

  public has(
    param: GameVersion | ModLoader | T | (Omit<T, "platform"> & Partial<Pick<T, "platform">>),
  ): boolean {
    return this.some(v => {
      if (typeof param === "string") {
        if (isLoader(param)) {
          return v.loader === param;
        }
        return v.gameVersion === param;
      }
      return (
        v.gameVersion === param.gameVersion &&
        v.loader === param.loader &&
        (!param.platform || v.platform === param.platform)
      );
    });
  }

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

  public override push(version: T) {
    if (!this.has(version)) {
      return super.push(version);
    }
    return this.length;
  }

  public override concat(...items: (T | ConcatArray<T>)[]): VersionSet<T> {
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
