import { values } from "lodash";

import { ModLoader } from "@mcmm/data";

import { ModLoaderType } from "./lib/types";

import type { Platform } from "@mcmm/data";
import type { PlatformPluginTypesTemplate } from "@mcmm/platform";
import type * as Curseforge from "./lib/types";
import type { CurseforgePlatformModMetadata } from "./plugin";

//================================================

export interface PlatformPluginTypesCurseforgePlugin {
  [Platform.Curseforge]: PlatformPluginTypesTemplate<
    CurseforgePlatformModMetadata,
    Curseforge.File,
    Curseforge.ModpackManifest,
    CurseforgePlatformModMetadata["id"]
  >;
}

export type CurseforgePlatformModExtraData = Record<ModLoader, CurseforgeCachedVersionFetchData>;

export interface CurseforgeCachedVersionFetchData {
  // store the last page fetched. if we're looking for a version older than the existing
  // minFetchedVersion, start at the last page fetched, and continue until we find the min
  // version we're looking for
  lastPageFetched: number;
  // If we're only looking for new files, then fetch until we encounter a file whose date is <=
  // the newest file date that we have stored
  newestFileDate: number;
}

export interface PlatformModExtraDataCurseforgePlugin {
  [Platform.Curseforge]: CurseforgePlatformModExtraData;
}

export const curseforgeModLoaderTypeMap = values(ModLoader)
  .map(loader => [ModLoaderType[loader], loader])
  .reduce((result, [key, value]) => {
    result[key] = value;
    return result;
  }, {} as any) as Record<ModLoaderType, ModLoader>;
