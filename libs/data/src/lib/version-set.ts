import { uniqBy, values } from "lodash";

import { ModLoader } from "./types";

import type { GameVersion, ModVersion } from "./types";

//================================================

const createOrAddToSet = <K, T>(map: Map<K, Set<T>>, key: K, value: T) => {
  const set = map.get(key);
  if (!set) {
    map.set(key, new Set([value]));
    return;
  }
  if (!set.has(value)) {
    set.add(value);
  }
};

export const buildVersionSetMaps = <T extends ModVersion = ModVersion>(
  items: T[],
  prevLoaderMap?: Map<ModLoader, Set<T>>,
  prevGameVersionMap?: Map<GameVersion, Set<T>>,
) => {
  const loaderMap = new Map<ModLoader, Set<T>>();
  const gameVersionMap = new Map<GameVersion, Set<T>>();
  if (prevLoaderMap) {
    prevLoaderMap.forEach((set, loader) => {
      loaderMap.set(loader, new Set(set));
    });
  }
  if (prevGameVersionMap) {
    prevGameVersionMap.forEach((set, gameVersion) => {
      gameVersionMap.set(gameVersion, new Set(set));
    });
  }

  items.forEach(v => {
    createOrAddToSet(loaderMap, v.loader, v);
    createOrAddToSet(gameVersionMap, v.gameVersion, v);
  });

  return { loaderMap, gameVersionMap };
};

const loaderValues = values(ModLoader);
const isLoader = (value: GameVersion | ModVersion): value is ModLoader =>
  loaderValues.includes(value as ModLoader);

export class VersionSet<T extends ModVersion = ModVersion> extends Array<T> {
  private loaderMap: Map<ModLoader, Set<T>>;
  private gameVersionMap: Map<GameVersion, Set<T>>;
  private _set: Set<T>;
  private stringSet: Set<string>;

  constructor(versionSet: VersionSet<T>);
  constructor(...items: T[]);
  constructor(
    items: T[],
    loaderMap?: Map<ModLoader, Set<T>>,
    gameVersionMap?: Map<GameVersion, Set<T>>,
  );
  constructor();
  constructor(
    first?: VersionSet<T> | T[] | T,
    prevLoaderMap?: Map<ModLoader, Set<T>> | T,
    prevGameVersionMap?: Map<GameVersion, Set<T>> | T,
    ...rest: T[]
  ) {
    let items: T[];
    if (!first || (!(first instanceof VersionSet) && !Array.isArray(first))) {
      items = [
        ...[first, prevLoaderMap, prevGameVersionMap].filter(
          (i): i is T => !!i && !(i instanceof Map),
        ),
        ...rest,
      ];
    } else {
      items = first instanceof VersionSet ? Array.from(first) : (first ?? []);
    }
    items = uniqBy(items, VersionSet.getStringForVersion);
    super(...items);
    this._set = new Set(items);
    this.stringSet = new Set(this.getStringForVersions(items));
    if (!first) {
      this.loaderMap = new Map();
      this.gameVersionMap = new Map();
    } else {
      const { loaderMap, gameVersionMap } =
        first instanceof VersionSet
          ? buildVersionSetMaps(items, first.loaderMap, first.gameVersionMap)
          : buildVersionSetMaps(
              items,
              prevLoaderMap instanceof Map ? prevLoaderMap : undefined,
              prevGameVersionMap instanceof Map ? prevGameVersionMap : undefined,
            );
      this.loaderMap = loaderMap;
      this.gameVersionMap = gameVersionMap;
    }
  }

  static getStringForVersion(version: ModVersion): string {
    return `${version.platform}:${version.loader}:${version.gameVersion}`;
  }

  private getStringForVersions(versions: T[]): string[] {
    return versions.map(VersionSet.getStringForVersion);
  }

  public has(
    param: GameVersion | ModLoader | T | (Omit<T, "platform"> & Partial<Pick<T, "platform">>),
  ): boolean {
    if (typeof param !== "string") {
      if (param.platform) {
        return this.stringSet.has(VersionSet.getStringForVersion(param as T));
      } else {
        return Array.from(this.gameVersionMap.get(param.gameVersion) ?? []).some(
          v => v.loader === param.loader,
        );
      }
    }
    return !!(isLoader(param)
      ? this.loaderMap.get(param)?.size
      : this.gameVersionMap.get(param)?.size);
  }

  public get(param: GameVersion | ModLoader) {
    const set = isLoader(param) ? this.loaderMap.get(param) : this.gameVersionMap.get(param);
    return set
      ? new VersionSet<T>(
          Array.from(set),
          isLoader(param) ? new Map([[param, set]] as const) : undefined,
          isLoader(param) ? undefined : new Map([[param, set]] as const),
        )
      : new VersionSet<T>();
  }

  public get gameVersions(): GameVersion[] {
    return Array.from(this.gameVersionMap.keys());
  }

  public get modLoaders() {
    return Array.from(this.loaderMap.keys());
  }

  private add(version: T) {
    if (this.has(version)) {
      return false;
    }
    this._set.add(version);
    this.stringSet.add(VersionSet.getStringForVersion(version));
    createOrAddToSet(this.loaderMap, version.loader, version);
    createOrAddToSet(this.gameVersionMap, version.gameVersion, version);
    return true;
  }

  public override push(version: T) {
    if (this.add(version)) {
      return super.push(version);
    }
    return this.length;
  }

  public override unshift(version: T) {
    if (this.add(version)) {
      super.unshift(version);
    }
    return this.length;
  }

  public override concat(...items: (T | ConcatArray<T>)[]): VersionSet<T> {
    const newSet = new VersionSet(this);
    items.forEach(itemOrArray => {
      if ("length" in itemOrArray) {
        itemOrArray.slice().forEach(item => newSet.push(item));
      } else {
        newSet.push(itemOrArray);
      }
    });
    return newSet;
  }

  public override includes(param: GameVersion | ModLoader | T): boolean {
    return this.has(param);
  }
}
