"use client";

import * as Immutable from "immutable";
import { v4 as uuid } from "uuid";

import { gameVersionComparator } from "@mcmm/utils";
import { curseforgeApi, modrinthApi, promiseAll } from "@mcmm/api";
import { VersionSet, parseCurseforgeModFileData, parseModrinthModVersionData } from "@mcmm/data";

import { loadDataRegistry, loadDataRegistryDb, storeDataRegistry } from "./storage";

import type { GameVersion, ModVersionData, Mod, ModMetadata } from "@mcmm/data";
import type {
  DataRegistryDb,
  DataRegistryDbEntry,
  DataRegistryEntry,
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

    this.db = loadDataRegistryDb();

    // TODO: Perform or schedule cache refresh
  }

  private cacheLifespan = 1000 * 60 * 60 * 24; // 1 day
  private lastRefresh = 0;

  private db: DataRegistryDb;
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

  public static parseDbEntry(dbEntry: DataRegistryDbEntry): DataRegistryEntry {
    const { minGameVersionFetched, dateModified, ...mod } = dbEntry;
    return {
      modId: mod.id ?? uuid(),
      minGameVersionFetched,
      dateModified,
      data: mod,
    };
  }

  public static createDbEntry(entry: DataRegistryEntry): DataRegistryDbEntry {
    const { minGameVersionFetched, dateModified, data } = entry;
    return {
      minGameVersionFetched,
      dateModified,
      ...data,
      id: data.id ?? uuid(),
    };
  }

  public async getAllMods() {
    return this.db.registry.toArray();
  }

  public async getModById(modId: string) {
    return this.db.registry.where("modId").equals(modId).first();
  }

  //================================================

  public async storeMod(meta: ModMetadata, minGameVersion: GameVersion): Promise<Mod | null> {
    const existingEntry = (
      await this.db.registry.where("meta.slug").equalsIgnoreCase(meta.slug).toArray()
    ).find(
      entry =>
        (meta.modrinth?.project_id == null ||
          meta.modrinth?.project_id === entry.meta.modrinth?.project_id) &&
        (meta.curseforge?.id == null || meta.curseforge?.id === entry.meta.curseforge?.id),
    );

    const existingEntryHasAllData =
      existingEntry &&
      ((existingEntry.meta.modrinth && !meta.curseforge) ||
        (existingEntry.meta.curseforge && !meta.modrinth)) &&
      !!existingEntry.minGameVersionFetched &&
      gameVersionComparator(existingEntry.minGameVersionFetched, minGameVersion) <= 0;

    if (
      !!existingEntry &&
      existingEntryHasAllData &&
      Date.now() - existingEntry.dateModified < this.cacheLifespan
    ) {
      return Promise.resolve(DataRegistry.parseDbEntry(existingEntry).data);
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
        id: existingEntry?.id ?? uuid(),
        name: meta.name,
        meta: {
          ...meta,
          curseforge: meta.curseforge ?? existingEntry?.meta?.curseforge,
          modrinth: meta.modrinth ?? existingEntry?.meta?.modrinth,
        },
        versions,
      };

      const entry: DataRegistryDbEntry = {
        ...mod,
        dateModified: Date.now(),
        minGameVersionFetched: minGameVersion,
      };
      this.db.registry.put(entry, entry.id);

      // this.registry = this.registry.set(mod.meta.slug, entry);
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
