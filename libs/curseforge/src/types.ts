import type { ModLoader, Platform } from "@mcmm/data";

//================================================

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
