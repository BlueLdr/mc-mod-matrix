"use client";

import { pick } from "lodash";

import { promiseAll } from "@mcmm/api";
import {
  getUniqueIdForPlatformModMeta,
  PlatformModMetadataCollection,
  VersionSet,
} from "@mcmm/data";
import { createDisplayableError } from "@mcmm/types";
import { comparator, makeRecordFromEntries } from "@mcmm/utils";

import type { GameVersion, ModMetadata, PlatformModMetadata, Mod, Platform } from "@mcmm/data";
import type { ApiResponse } from "@mcmm/api";
import type { PlatformPlugin } from "./plugin";

//================================================

const MAX_SEARCH_RESULT_COUNT = isNaN(
  Number(process.env["NEXT_PUBLIC_MCMM_MAX_SEARCH_RESULT_COUNT"]),
)
  ? 10
  : Number(process.env["NEXT_PUBLIC_MCMM_MAX_SEARCH_RESULT_COUNT"]);

export class PlatformPluginManager {
  constructor(plugins: PlatformPlugin<unknown>[]) {
    this.plugins = plugins;
  }

  plugins: PlatformPlugin<unknown>[];

  getModLink(meta: PlatformModMetadata) {
    const plugin = this.plugins.find(p => p.platformName === meta.platform);
    if (plugin) {
      return new URL(meta.slug, plugin.modUrlBase).toString();
    }
    return undefined;
  }

  //================================================

  searchMods(
    searchText: string,
    isSameMod: (a: PlatformModMetadata, b: PlatformModMetadata) => Promise<boolean>,
    getModFromRegistry: (meta: PlatformModMetadata) => Promise<Mod | undefined>,
    platforms?: Platform[],
  ): Promise<ApiResponse<ModMetadata[]>> {
    const promises: Record<string, Promise<ApiResponse<PlatformModMetadata[]>>> = {};
    this.plugins
      .filter(plugin => !platforms || platforms.includes(plugin.platformName))
      .forEach(plugin => {
        promises[plugin.platformName] = plugin.searchMods(searchText).then(({ data, error }) => {
          if (error) {
            console.error("searchMods", plugin.platformName, error);
            return { data: null, error };
          }
          return { data: data?.map(plugin.toModMetadata), error: null };
        });
      });

    return promiseAll(promises)
      .then(async ({ data, error }) => {
        if (error) {
          return { data: null, error };
        }
        return {
          data: await this.processSearchResults(
            data as Record<Platform, PlatformModMetadata[]>,
            isSameMod,
            getModFromRegistry,
          ),
          error: null,
        };
      })
      .catch(error => ({
        data: null,
        error: createDisplayableError(error),
      }));
  }

  //================================================

  getModVersions(
    platforms: ModMetadata["platforms"],
    minGameVersion: GameVersion,
  ): Promise<ApiResponse<VersionSet>> {
    // @ts-expect-error: initially empty
    const promises: Record<Platform, Promise<ApiResponse<VersionSet>>> = {};
    this.plugins.forEach(plugin => {
      const platformMeta = platforms.get(plugin.platformName);
      if (platformMeta) {
        promises[plugin.platformName] = plugin.getModVersions(platformMeta, minGameVersion);
      }
    });

    return promiseAll(promises).then(({ data, error }) => {
      if (error) {
        return { data: null, error };
      }
      return {
        data: Object.values(data).reduce(
          (output, versions) => output.concat(versions),
          new VersionSet(),
        ),
        error: null,
      };
    });
  }

  getModVersionsForPlatform(
    meta: PlatformModMetadata,
    minGameVersion: GameVersion,
  ): Promise<ApiResponse<VersionSet>> {
    const plugin = this.plugins.find(p => p.platformName === meta.platform);
    if (!plugin) {
      return Promise.resolve({
        data: null,
        error: createDisplayableError(
          new Error(`Tried to fetch versions for invalid platform "${meta.platform}"`),
        ),
      });
    }
    return plugin.getModVersions(meta, minGameVersion);
  }

  //================================================

  getModMetadataFromPlatformMetaSet(
    metaSet: PlatformModMetadata[],
    minGameVersionFetched?: GameVersion,
  ): ModMetadata {
    return {
      name: metaSet[0].modName,
      image: metaSet.find(meta => !!meta.thumbnailUrl)?.thumbnailUrl ?? "",
      platforms: new PlatformModMetadataCollection(...metaSet),
      minGameVersionFetched,
    };
  }

  private async findMatchingMod(
    item: PlatformModMetadata,
    others: PlatformModMetadata[],
    isSameMod: (a: PlatformModMetadata, b: PlatformModMetadata) => Promise<boolean>,
  ) {
    for (const other of others) {
      if (await isSameMod(item, other)) {
        return other;
      }
    }
    return undefined;
  }

  private async processSearchResults(
    data: Record<Platform, PlatformModMetadata[]>,
    isSameMod: (a: PlatformModMetadata, b: PlatformModMetadata) => Promise<boolean>,
    getModFromRegistry: (meta: PlatformModMetadata) => Promise<Mod | undefined>,
  ) {
    const platformCount = Object.keys(data).length;

    const mappedData = makeRecordFromEntries(
      Object.entries(data).map(([key, list]) => [
        key as Platform,
        new Map(list.map(item => [getUniqueIdForPlatformModMeta(item), item])),
      ]),
    );

    const results: [index: number, meta: ModMetadata][] = [];
    let shouldStop = false;

    while (Object.values(mappedData).some(map => !!map.size) && !shouldStop) {
      for (const map of Object.values(mappedData)) {
        const entry = Array.from(map.entries()).shift();
        if (!entry) {
          continue;
        }
        const [itemId, item] = entry;
        map.delete(itemId);

        const arrayDict = makeRecordFromEntries(
          Object.entries(mappedData).map(([key, map]) => [
            key as Platform,
            Array.from(map.values()),
          ]),
        );
        const modMetadata = await this.processSearchResult(
          item,
          arrayDict,
          isSameMod,
          getModFromRegistry,
        );
        this.removePickedMatchesFromResults(modMetadata, mappedData);

        const index = data[item.platform].indexOf(item) - modMetadata.platforms.length;
        results.push([index, modMetadata]);

        if (
          results.filter(item => item[1].platforms.length === platformCount).length >=
          MAX_SEARCH_RESULT_COUNT
        ) {
          shouldStop = true;
        }
      }
    }

    return results
      .sort(comparator("asc", ([index]: [number, ModMetadata]) => index))
      .map(([, item]) => item);
  }

  private async processSearchResult(
    item: PlatformModMetadata,
    data: Record<Platform, PlatformModMetadata[]>,
    isSameMod: (a: PlatformModMetadata, b: PlatformModMetadata) => Promise<boolean>,
    getModFromRegistry: (meta: PlatformModMetadata) => Promise<Mod | undefined>,
  ): Promise<ModMetadata> {
    const existingRegistryEntry = await getModFromRegistry(item);
    if (existingRegistryEntry) {
      return pick(existingRegistryEntry, ["name", "image", "platforms", "minGameVersionFetched"]);
    }

    const map = new Map<Platform, PlatformModMetadata>([[item.platform, item]]);

    for (const [key, resultsFromOtherPlatform] of Object.entries(data)) {
      if (key === item.platform || !resultsFromOtherPlatform.length) {
        continue;
      }
      const match = await this.findMatchingMod(item, resultsFromOtherPlatform, isSameMod);
      if (match) {
        map.set(match.platform, match);
      }
    }

    // ensure sort order stays the same
    const metaSet = this.plugins
      .slice()
      .sort(comparator("asc", "platformName"))
      .map(plugin => map.get(plugin.platformName))
      .filter(i => !!i);

    return this.getModMetadataFromPlatformMetaSet(metaSet);
  }

  private async removePickedMatchesFromResults(
    result: ModMetadata,
    data: Record<Platform, Map<string, PlatformModMetadata>>,
  ) {
    for (const platformMeta of result.platforms) {
      const id = getUniqueIdForPlatformModMeta(platformMeta);
      const map = data[platformMeta.platform];
      map?.delete(id);
    }
  }
}
