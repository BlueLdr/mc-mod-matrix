"use client";

import { v4 as uuid } from "uuid";

import { getMinGameVersion, makeRecordFromEntries } from "@mcmm/utils";
import {
  getUniqueIdForPlatformModMeta,
  PlatformModMetadataCollection,
  VersionSet,
} from "@mcmm/data";

import { platformManager } from "../manager";

import type {
  GameVersion,
  ModMetadata,
  ModVersion,
  PlatformModVersion,
  Platform,
  Mod,
  PlatformModMetadata,
} from "@mcmm/data";
import type {
  DataRegistryDb,
  ModDbEntry,
  PlatformModDbEntry,
  PlatformModVersionDbEntry,
} from "./types";

//================================================

export class DataRegistryHelper {
  constructor(db: DataRegistryDb) {
    this.db = db;
    this.platformIdTypeMap = makeRecordFromEntries(
      platformManager.plugins.map(p => [p.platformName, p.idType]),
    );
  }

  private db: DataRegistryDb;
  private platformIdTypeMap: Record<Platform, "string" | "number">;

  //================================================

  public async parseModDbEntry(dbEntry: ModDbEntry): Promise<Mod> {
    const {
      id = uuid(),
      name,
      image,
      alternatives,
      platforms: platformModRecordIds,
      minGameVersionFetched,
    } = dbEntry;

    const platforms = new PlatformModMetadataCollection(
      ...(await this.db.platformMods.bulkGet(platformModRecordIds))
        .filter(m => !!m)
        .map(this.parsePlatformModDbEntry.bind(this)),
    );

    let versions = new VersionSet();
    for (const meta of platforms) {
      const platformVersions = await this.getVersionsForPlatformMod(meta.id, meta.platform);
      versions = versions.concat(
        platformVersions.map(this.parsePlatformModVersionDbEntry.bind(this)),
      );
    }

    return {
      id,
      name,
      image,
      alternatives,
      platforms,
      versions,
      minGameVersionFetched,
    };
  }

  public parsePlatformModDbEntry<Id extends string | number = string | number>(
    dbEntry: PlatformModDbEntry<Id>,
  ): PlatformModMetadata<Id> {
    return dbEntry.meta;
  }

  public parsePlatformModVersionDbEntry<Id extends string | number = string | number>(
    dbEntry: PlatformModVersionDbEntry<Id>,
  ): ModVersion {
    const { loader, gameVersion, platform } = dbEntry;
    return {
      loader,
      gameVersion,
      platform,
    };
  }

  //================================================

  public async writeMod(
    mod: Omit<Mod, "id"> & { id?: string },
    versionFetched?: GameVersion,
  ): Promise<ModDbEntry> {
    const {
      id = uuid(),
      name,
      image,
      alternatives,
      platforms,
      versions,
      minGameVersionFetched,
    } = mod;
    const platformIds: string[] = [];
    for (const platform of platforms) {
      platformIds.push(await this.writePlatformMod(platform, versionFetched));
      const platVersions = versions.filter(v => v.platform === platform.platform);
      await this.writePlatformModVersions(platVersions, platform.id, platform.platform);
    }

    const newMod: ModDbEntry = {
      id,
      name,
      image,
      alternatives,
      platforms: platformIds,
      minGameVersionFetched:
        versionFetched && minGameVersionFetched
          ? getMinGameVersion(minGameVersionFetched, versionFetched)
          : (versionFetched ?? minGameVersionFetched),
    };
    await this.db.mods.put(newMod, newMod.id);
    return newMod;
  }

  public async writePlatformMod<Id extends string | number = string | number>(
    meta: PlatformModMetadata<Id>,
    minGameVersionFetched?: string,
  ) {
    let record = await this.getPlatformModByModId(meta.id);
    if (!record) {
      record = {
        id: getUniqueIdForPlatformModMeta(meta),
        meta: {
          ...meta,
          minGameVersionFetched,
          lastUpdated: meta.lastUpdated ?? 0,
        },
      };
    }
    if (minGameVersionFetched) {
      record.meta.minGameVersionFetched = minGameVersionFetched;
      record.meta.lastUpdated = Date.now();
    }
    return this.db.platformMods.put(record, record.id);
  }

  public async writePlatformModVersions(
    versions: PlatformModVersion[],
    modId: string | number,
    platform: Platform,
  ) {
    return this.db.platformModVersions.bulkPut(
      versions.map(v => ({ ...v, modId: `${modId}`, platform })),
    );
  }

  //================================================

  public async getAllMods() {
    const allEntries = await this.db.mods.toArray();
    const mods: Mod[] = [];
    for (const entry of allEntries) {
      mods.push(await this.parseModDbEntry(entry));
    }
    return mods;
  }

  public async getVersionsForPlatformMod(id: string | number, platform: Platform) {
    return this.db.platformModVersions
      .where("modId")
      .equals(`${id}`)
      .and(v => v.platform === platform)
      .toArray();
  }

  public async getPlatformModByModId(id: string | number) {
    return this.db.platformMods.where("meta.id").equals(id).first();
  }

  public async getModEntryById(id: string) {
    return this.db.mods.get(id);
  }

  public async getModById(id: string) {
    return this.db.mods.get(id).then(entry => (entry ? this.parseModDbEntry(entry) : undefined));
  }

  public async getModByMeta(meta: ModMetadata, strict?: boolean) {
    const platforms = await this.db.platformMods
      .where("[meta.id+meta.platform]")
      .anyOf(meta.platforms.map(p => [p.id, p.platform]))
      .toArray();
    if (platforms.length) {
      const platformIds = platforms.map(p => p.id);
      const query = await this.db.mods.where("platforms").anyOf(platformIds);
      const mod = await (
        strict ? query.and(entry => platformIds.every(id => entry.platforms.includes(id))) : query
      ).first();
      if (mod) {
        return this.parseModDbEntry(mod);
      }
    }
  }

  public async getModByPlatformMeta(meta: PlatformModMetadata) {
    const platformModEntry = await this.db.platformMods.get({
      "[meta.id+meta.platform]": [meta.id, meta.platform],
    });
    if (platformModEntry) {
      return this.db.mods
        .where("platforms")
        .equals(platformModEntry.id)
        .first()
        .then(entry => (entry ? this.parseModDbEntry(entry) : undefined));
    }
  }

  public async getModsByIds(ids: string[]) {
    const entries = await this.db.mods.bulkGet(ids).then(mods => mods.filter(m => !!m));
    const mods: Mod[] = [];
    for (const entry of entries) {
      mods.push(await this.parseModDbEntry(entry));
    }
    return mods;
  }

  //================================================

  public async refreshModVersions(
    platformsCollection: PlatformModMetadataCollection,
    minVersion: GameVersion,
    enableLogging?: boolean,
  ) {
    const log = enableLogging ? console.debug : (...args: any[]) => undefined;

    log(`Fetching versions after ${minVersion}`);
    const { data: versions, error } = await platformManager.getModVersions(
      platformsCollection,
      minVersion,
    );

    if (versions) {
      log(`Writing updates to versions...`, versions);
      await this.db.platformModVersions.bulkPut(
        versions.reduce((arr, v) => {
          // get the PlatformModMetadata that this version belongs to
          const platform = platformsCollection.get(v.platform);
          if (platform) {
            arr.push({
              ...v,
              modId: `${platform.id}`,
              platform: platform.platform,
            });
          }
          return arr;
        }, [] as PlatformModVersionDbEntry[]),
      );

      log(`Writing update to PlatformModMetadata...`);
      for (const platform of platformsCollection) {
        await this.writePlatformMod(platform, minVersion);
      }
    } else if (error) {
      return Promise.reject(error);
    }
  }

  //================================================

  public async updateModMeta(
    id: string,
    data: Partial<Pick<Mod, "name" | "image" | "alternatives">>,
  ) {
    return this.db.mods.update(id, data);
  }

  public async removePlatformFromMod(id: string, platform: Platform) {
    const entry = await this.getModEntryById(id);
    if (!entry) {
      return;
    }

    const platforms = await this.db.platformMods.bulkGet(entry.platforms);

    const newEntry: ModDbEntry = {
      ...entry,
      platforms: platforms
        .filter(p => !!p)
        .filter(p => p.meta.platform !== platform)
        .map(p => p.id),
    };
    await this.db.mods.put(newEntry, id);
  }
}
