"use client";

import { gameVersionComparator } from "@mcmm/utils";
import { platformManager } from "~/data";

import { DataRegistryHelper } from "./helper";
import { loadDataRegistryDb } from "./storage";

import type { GameVersion, Mod, ModMetadata, Platform } from "@mcmm/data";
import type { DataRegistryDb } from "./types";

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

  public async storeMod(meta: ModMetadata, minGameVersion: GameVersion): Promise<Mod | null> {
    if (!this.db || !this.helper) {
      return null;
    }

    const existingEntry = await this.helper?.getModByMeta(meta);

    const existingEntryHasAllData =
      existingEntry &&
      meta.platforms.every(platformMeta => existingEntry.platforms.has(platformMeta.platform)) &&
      !!existingEntry.minGameVersionFetched &&
      gameVersionComparator(existingEntry.minGameVersionFetched, minGameVersion) <= 0;

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
    const { data, error } = await platformManager.getModVersions(meta.platforms, minGameVersion);
    if (error) {
      console.error("Failed to fetch version data while storing mod in registry", error);
    }
    if (!data) {
      console.error("MISSING DATA from platformManager.getModVersions", meta);
      return null;
    }

    const mod = existingEntry ?? {
      ...meta,
      versions: data,
      alternatives: [],
    };
    mod.minGameVersionFetched = minGameVersion;

    const result = await this.helper?.writeMod(mod, minGameVersion);

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

  public forceRefresh() {}

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
