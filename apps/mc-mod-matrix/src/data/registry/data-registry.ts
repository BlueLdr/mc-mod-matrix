"use client";

import { v4 as uuid } from "uuid";

import {
  getUniqueIdForModMetadata,
  getUniqueIdForPlatformModMeta,
  PlatformModMetadataCollection,
} from "@mcmm/data";
import { gameVersionComparator } from "@mcmm/utils";
import { platformManager } from "~/data";

import { loadDataRegistry, loadDataRegistryDb } from "./storage";

import type { PlatformModMetadata, GameVersion, Mod, ModMetadata, Platform } from "@mcmm/data";
import type {
  DataRegistryDb,
  DataRegistryDbEntry,
  DataRegistryEntry,
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
    const { lastRefresh } = loadDataRegistry();
    this.lastRefresh = lastRefresh;
    // this.curseforgeVersionTypeRegistry = curseforgeVersionTypeRegistry;
    // this.initCurseforgeVersionTypeRegistry();

    this._db = loadDataRegistryDb();

    // TODO: Perform or schedule cache refresh
  }

  private cacheLifespan = 1000 * 60 * 60 * 24; // 1 day
  private lastRefresh = 0;

  private _db: DataRegistryDb;

  public onRegistryChanged?: React.Dispatch<React.SetStateAction<DataRegistryMap>>;

  //================================================

  public get db(): DataRegistryDb {
    return this._db;
  }

  public static parseDbEntry(dbEntry: DataRegistryDbEntry): DataRegistryEntry {
    const { minGameVersionFetched, dateModified, ...mod } = dbEntry;

    return {
      modId: mod.id ?? uuid(),
      minGameVersionFetched,
      dateModified,
      data: {
        ...mod,
        meta: {
          ...mod.meta,
          platforms: new PlatformModMetadataCollection(...(mod.meta.platforms ?? [])),
        },
      },
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
    return (await this._db.registry.toArray()).map(DataRegistry.parseDbEntry);
  }

  public async getModById(modId: string) {
    const entry = await this._db.registry.get(modId);
    return entry ? DataRegistry.parseDbEntry(entry) : undefined;
  }

  public async getModByMeta(meta: ModMetadata) {
    const mods = await this.getAllMods();
    return mods.find(
      mod => getUniqueIdForModMetadata(meta) === getUniqueIdForModMetadata(mod.data.meta),
    );
  }

  public async getModByPlatformMeta(meta: PlatformModMetadata) {
    const mods = await this.getAllMods();
    return mods.find(mod =>
      getUniqueIdForModMetadata(mod.data.meta).includes(getUniqueIdForPlatformModMeta(meta)),
    );
  }

  //================================================

  public async storeMod(meta: ModMetadata, minGameVersion: GameVersion): Promise<Mod | null> {
    const existingEntry = (await this.getAllMods()).find(entry =>
      meta.platforms.some(item =>
        getUniqueIdForModMetadata(entry.data.meta).includes(getUniqueIdForPlatformModMeta(item)),
      ),
    );

    const existingEntryHasAllData =
      existingEntry &&
      meta.platforms.every(platformMeta =>
        existingEntry.data.meta.platforms.has(platformMeta.platform),
      ) &&
      !!existingEntry.minGameVersionFetched &&
      gameVersionComparator(existingEntry.minGameVersionFetched, minGameVersion) <= 0;

    if (
      !!existingEntry &&
      existingEntryHasAllData &&
      Date.now() - existingEntry.dateModified < this.cacheLifespan
    ) {
      return existingEntry.data;
    }

    const { data, error } = await platformManager.getModVersions(meta, minGameVersion);
    if (error) {
      console.error("Failed to fetch version data while storing mod in registry", error);
    }
    if (!data) {
      console.error("MISSING DATA from platformManager.getModVersions", meta);
      return null;
    }

    const mod: Mod = {
      id: existingEntry?.modId ?? uuid(),
      name: meta.name,
      meta,
      versions: data,
    };

    const entry: DataRegistryDbEntry = {
      ...mod,
      dateModified: Date.now(),
      minGameVersionFetched: minGameVersion,
    };
    this._db.registry.put(entry, entry.id);

    // this.registry = this.registry.set(mod.meta.slug, entry);
    return mod;
  }

  public async removePlatformFromMod(id: string, platform: Platform) {
    const entry = await this.getModById(id);
    if (!entry) {
      return;
    }
    const newEntry: DataRegistryEntry = {
      ...entry,
      data: {
        ...entry.data,
        meta: {
          ...entry.data.meta,
          platforms: new PlatformModMetadataCollection(...entry.data.meta.platforms),
        },
      },
    };
    newEntry.data.meta.platforms.remove(platform);
    await this._db.registry.put(DataRegistry.createDbEntry(newEntry), id);
  }

  public async updateModRootMeta(
    id: string,
    property: keyof Pick<ModMetadata, "name" | "image">,
    platform: Platform,
  ) {
    const entry = await this.getModById(id);
    if (!entry) {
      return;
    }
    const targetMeta = entry.data.meta.platforms.get(platform);
    if (!targetMeta) {
      return;
    }
    const newEntry: DataRegistryEntry = {
      ...entry,
      data: {
        ...entry.data,
        meta: {
          ...entry.data.meta,
          [property]: targetMeta[property === "image" ? "thumbnailUrl" : "modName"],
        },
      },
    };
    if (property === "name") {
      newEntry.data.name = targetMeta.modName;
    }
    await this._db.registry.put(DataRegistry.createDbEntry(newEntry), id);
  }

  //================================================

  public forceRefresh() {}

  //================================================

  public async setModAlternatives(mod: Mod, alternatives: string[]) {
    const entry = await this.getModById(mod.id);
    if (
      !entry ||
      (!alternatives.length && !entry.data.alternatives) ||
      JSON.stringify(alternatives) === JSON.stringify(entry.data.alternatives)
    ) {
      return;
    }
    const newData = { ...entry };

    if (!alternatives.length) {
      delete newData.data.alternatives;
    } else {
      newData.data.alternatives = alternatives;
    }

    await this.db.registry.put(DataRegistry.createDbEntry(newData), mod.id);
    return;
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
