"use client";

import * as Immutable from "immutable";

import { gameVersionComparator } from "@mcmm/utils";
import { curseforgeApi, modrinthApi, promiseAll } from "@mcmm/api";
import { VersionSet, parseCurseforgeModFileData, parseModrinthModVersionData } from "@mcmm/data";

import { loadDataRegistry, storeDataRegistry } from "./storage";

import type { GameVersion, ModVersionData, Mod, ModMetadata } from "@mcmm/data";
import type {
  // CurseforgeVersionTypeRegistry,
  DataRegistryEntryMap,
  DataRegistryEntryRecord,
  DataRegistryMap,
} from "./types";

//================================================

export interface DataRegistryInit {
  // default: 1 day
  cacheLifespan?: number;
  // setState: React.Dispatch<React.SetStateAction<DataRegistryMap>>;
}

export class DataRegistry {
  constructor({ cacheLifespan }: DataRegistryInit = {}) {
    if (cacheLifespan) {
      this.cacheLifespan = cacheLifespan;
    }
    const { lastRefresh, registry /*curseforgeVersionTypeRegistry*/ } = loadDataRegistry();
    this._registry = Immutable.Map(registry);
    this.lastRefresh = lastRefresh;
    // this.curseforgeVersionTypeRegistry = curseforgeVersionTypeRegistry;
    // this.initCurseforgeVersionTypeRegistry();

    // TODO: Perform or schedule cache refresh
  }

  private cacheLifespan = 1000 * 60 * 60 * 24; // 1 day
  private lastRefresh = 0;

  private _registry: DataRegistryEntryMap = Immutable.Map();

  public onRegistryChanged?: React.Dispatch<React.SetStateAction<DataRegistryMap>>;

  //================================================

  private get registry() {
    return this._registry;
  }

  private set registry(newValue: DataRegistryEntryMap) {
    this._registry = newValue;
    this.onRegistryChanged?.(this.registryData);
    this.save();
  }

  public get registryData(): DataRegistryMap {
    return Immutable.Map(this._registry.mapEntries(([key, entry]) => [key, entry.data]));
  }

  public save() {
    storeDataRegistry({
      lastRefresh: this.lastRefresh,
      registry: Array.from(this.registry.entries()).reduce<DataRegistryEntryRecord>(
        (obj, [key, value]) => {
          obj[key] = value;
          return obj;
        },
        {} as DataRegistryEntryRecord,
      ),
      // curseforgeVersionTypeRegistry: this.curseforgeVersionTypeRegistry,
    });
  }

  //================================================

  public storeMod(meta: ModMetadata, minGameVersion: GameVersion) {
    const existingEntry = this.registry.get(meta.slug);

    const existingEntryHasAllData =
      existingEntry &&
      ((existingEntry.data.meta.modrinth && !meta.curseforge) ||
        (existingEntry.data.meta.curseforge && !meta.modrinth)) &&
      !!existingEntry.minGameVersionFetched &&
      gameVersionComparator(existingEntry.minGameVersionFetched, minGameVersion) <= 0;

    if (existingEntryHasAllData && Date.now() - existingEntry.dateModified < this.cacheLifespan) {
      return Promise.resolve(existingEntry.data);
    }

    const promises = {
      modrinth: meta.modrinth?.slug
        ? modrinthApi.getModVersions(meta.modrinth?.slug)
        : Promise.resolve({ data: [] }),
      curseforge: meta.curseforge?.slug
        ? curseforgeApi.getModVersions(meta.curseforge.id, minGameVersion)
        : Promise.resolve({ data: [] }),
    };

    return promiseAll(promises).then(({ data }): Mod | null => {
      let modrinthData = new VersionSet<ModVersionData>();
      let curseforgeData = new VersionSet<ModVersionData>();
      if (data?.modrinth) {
        modrinthData = parseModrinthModVersionData(meta.modrinth!, data.modrinth);
      }
      if (data?.curseforge) {
        curseforgeData = parseCurseforgeModFileData(meta.curseforge!, data.curseforge);
      }

      const versions = modrinthData.concat(curseforgeData);
      const mod: Mod = {
        name: meta.name,
        meta,
        versions,
      };

      this.registry = this.registry.set(mod.meta.slug, {
        data: mod,
        dateModified: Date.now(),
        minGameVersionFetched: minGameVersion,
      });
      return mod;
    });
  }

  //================================================

  public forceRefresh() {}

  //================================================

  public setModAlternatives(mod: Mod, alternatives: ModMetadata[]) {
    const entry = this.registry.get(mod.meta.slug);
    if (
      !entry ||
      (!alternatives.length && !entry.data.alternatives) ||
      JSON.stringify(alternatives) === JSON.stringify(entry.data.alternatives)
    ) {
      return;
    }
    const newData = { ...entry.data };

    if (!alternatives.length) {
      delete newData.alternatives;
    } else {
      newData.alternatives = alternatives;
    }

    this.registry = this.registry.set(entry.data.meta.slug, {
      ...entry,
      data: newData,
    });
  }

  //#region Curseforge-specific =====================================
  /*

    private curseforgeVersionTypeRegistry: CurseforgeVersionTypeRegistry;

    private initCurseforgeVersionTypeRegistry() {
      if (this.curseforgeVersionTypeRegistry?.raw?.length) {
        console.log(`this.curseforgeVersionTypeRegistry: `, this.curseforgeVersionTypeRegistry);
        return;
      }

      /!*curseforgeApi.getMinecraftGameVersions().then(({ data }) => {
        console.log(`gameVersion data: `, data);
      });
      curseforgeApi.getMinecraftLoaderVersions({ includeAll: true }).then(({ data }) => {
        console.log(`gameVersion data: `, data);
      });*!/
      curseforgeApi.getGameVersions().then(({ data }) => {
        console.log(`getGameVersions data: `, data);
        const gameVersionTypes = data?.data.filter(
          item =>
            item.versions.every(ver => /^1\.\d+(\.\d+)?(-Snapshot)?$/i.test(ver.name)) &&
            item.versions.some(ver => /^1\.\d+-Snapshot$/i.test(ver.name)),
        );
        console.log(`gameVersionTypes: `, gameVersionTypes);

        this.curseforgeVersionTypeRegistry = {
          raw: data,
        };
        this.save();
      });
    }
  */

  //#endregion
}
