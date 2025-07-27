"use client";

import { gameVersionComparator } from "@mcmm/utils";
import { platformManager } from "~/data";
import { VersionSet } from "@mcmm/data";

import { DataRegistryHelper } from "./helper";
import { loadDataRegistryDb } from "./storage";

import type { GameVersion, Mod, ModMetadata, Platform } from "@mcmm/data";
import type { PlatformModExtraData } from "@mcmm/platform";
import type { DataRegistryDb, DataRegistryExportedData } from "./types";

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
    // this.curseforgeVersionTypeRegistry = curseforgeVersionTypeRegistry;
    // this.initCurseforgeVersionTypeRegistry();

    this.db = loadDataRegistryDb();
    this.helper = new DataRegistryHelper(this.db);
  }

  private cacheLifespan = 1000 * 60 * 60 * 24; // 1 day

  public readonly db: DataRegistryDb;
  public readonly helper: DataRegistryHelper;

  //================================================

  public async storeMod(meta: ModMetadata, minGameVersion?: GameVersion): Promise<Mod | null> {
    if (!this.db || !this.helper) {
      return null;
    }

    const existingEntry = await this.helper?.getModByMeta(meta);

    const existingEntryHasAllData =
      existingEntry &&
      meta.platforms.every(platformMeta => existingEntry.platforms.has(platformMeta.platform)) &&
      (!minGameVersion ||
        (!!existingEntry.minGameVersionFetched &&
          gameVersionComparator(existingEntry.minGameVersionFetched, minGameVersion) <= 0));

    const lastUpdated = Math.min(
      ...(existingEntry?.platforms?.map(p => p.lastUpdated ?? 0) ?? [0]),
    );
    if (
      !!existingEntry &&
      existingEntryHasAllData &&
      Date.now() - lastUpdated < this.cacheLifespan
    ) {
      return existingEntry;
    }

    if (existingEntry) {
      meta.platforms = existingEntry.platforms.merge(meta.platforms);
    }

    const mod = existingEntry ?? {
      ...meta,
      versions: new VersionSet(),
      alternatives: [],
    };
    let extraData: PlatformModExtraData | undefined = undefined;

    if (minGameVersion) {
      const { data, error } = await platformManager.getModVersions(meta.platforms, minGameVersion);
      if (error) {
        console.error("Failed to fetch version data while storing mod in registry", error);
      }
      if (!data) {
        console.error("MISSING DATA from platformManager.getModVersions", meta);
        return null;
      }

      mod.versions = data.versions;
      mod.minGameVersionFetched = minGameVersion;
      extraData = data.extraData;
    }

    const result = await this.helper?.writeMod(mod, minGameVersion, extraData);

    return {
      id: result.id,
      ...mod,
    };
  }

  public async updateModRootMeta(
    id: string,
    property: keyof Pick<ModMetadata, "name" | "image">,
    platform: Platform,
  ) {
    const entry = await this.helper?.getModById(id);
    if (!entry) {
      return;
    }
    const targetMeta = entry.platforms.get(platform);
    if (!targetMeta) {
      return;
    }
    const newEntry = {
      [property]: targetMeta[property === "image" ? "thumbnailUrl" : "modName"],
    };
    await this.helper?.updateModMeta(id, newEntry);
  }

  //================================================

  public async setModAlternatives(mod: Mod, alternatives: string[]) {
    const entry = await this.helper?.getModById(mod.id);
    if (
      !entry ||
      (!alternatives.length && !entry.alternatives.length) ||
      JSON.stringify(alternatives) === JSON.stringify(entry.alternatives)
    ) {
      return;
    }
    return await this.helper?.updateModMeta(mod.id, { alternatives });
  }

  //================================================

  public async exportData() {
    const json: DataRegistryExportedData = {
      mods: [],
      platformMods: [],
      platformModVersions: [],
    };

    await this.db.mods.each(item => json.mods.push(item));
    await this.db.platformMods.each(item => json.platformMods.push(item));
    await this.db.platformModVersions.each(item => json.platformModVersions.push(item));

    return json;
  }

  public async importData(data: DataRegistryExportedData) {
    this.db.close({ disableAutoOpen: true });
    const db = loadDataRegistryDb(true);
    return db.open().then(async () =>
      db
        .transaction("rw", db.mods, db.platformMods, db.platformModVersions, async tx => {
          await tx.mods.clear().then(() => tx.mods.bulkAdd(data.mods));
          await tx.platformMods.clear().then(() => tx.platformMods.bulkAdd(data.platformMods));
          await tx.platformModVersions
            .clear()
            .then(() => tx.platformModVersions.bulkAdd(data.platformModVersions));
        })
        .then(() => window.location.reload()),
    );
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
