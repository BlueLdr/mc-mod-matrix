import { PlatformModMetadataCollection } from "@mcmm/data";

import { platformManager } from "../manager";
import { loadDataRegistryDb } from "./storage";

import type {
  DataRefreshProgressData,
  PlatformModDbEntry,
  PlatformModVersionDbEntry,
} from "~/data";

//================================================

const _cache_lifespan = Number(process.env.NEXT_PUBLIC_MCMM_DATA_REGISTRY_CACHE_LIFESPAN);
const CACHE_LIFESPAN = isNaN(_cache_lifespan) ? 1000 * 60 * 60 * 24 : _cache_lifespan;

const _refresh_interval = Number(process.env.NEXT_PUBLIC_MCMM_DATA_REGISTRY_REFRESH_INTERVAL);
const REFRESH_INTERVAL = isNaN(_refresh_interval) ? 1000 * 60 * 10 : _refresh_interval;

const _fetch_interval = Number(process.env.NEXT_PUBLIC_MCMM_DATA_REGISTRY_REFRESH_FETCH_INTERVAL);
const FETCH_INTERVAL = isNaN(_fetch_interval) ? 1000 : _fetch_interval;

const getFetchIntervalWithVariance = () =>
  FETCH_INTERVAL + (Math.random() * 0.5 * FETCH_INTERVAL - 0.25 * FETCH_INTERVAL);

const initializeTask = () => {
  const db = loadDataRegistryDb();

  let refreshTimer: any = undefined;

  const doRefresh = async (records: PlatformModDbEntry[]) => {
    const map = new Map(records.map(r => [r.id, r]));
    while (map.size) {
      // get the first record in the set
      const record = map.values().toArray().shift();
      if (!record) {
        return;
      }
      postMessage({
        progress: {
          total: records.length,
          complete: false,
          current: {
            index: records.length - map.size,
            name: record.meta.modName,
          },
        } satisfies DataRefreshProgressData,
      });
      console.groupCollapsed(`Refreshing versions for mod "${record.meta.modName}"...`);

      // get corresponding mod record
      const mod = await db.mods.where("platforms").equals(record.id).first();
      const minVersion = mod?.minGameVersionFetched;

      if (minVersion) {
        // get the PlatformModDbEntries for the mod so we can update them in parallel
        const platforms = mod.platforms.map(id => map.get(id)).filter(m => !!m);
        const platformsCollection = new PlatformModMetadataCollection(
          ...platforms.map(p => p.meta),
        );

        console.debug(`Fetching versions after ${minVersion}`);
        const { data: versions, error } = await platformManager.getModVersions(
          platformsCollection,
          minVersion,
        );
        if (versions) {
          console.debug(`Writing updates to versions...`, versions);
          await db.platformModVersions.bulkPut(
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

          console.debug(`Writing update to PlatformModMetadata...`);
          await db.platformMods.bulkPut(
            platforms.map(rec => ({ ...rec, meta: { ...rec.meta, lastUpdated: Date.now() } })),
          );

          // remove all platforms for this mod from the map
          platforms.map(({ id }) => map.delete(id));
        } else {
          console.error(error);
        }
      } else {
        console.debug(`No minVersion found, aborting...`, mod);
      }
      console.groupEnd();
      if (map.size) {
        await new Promise<void>(resolve =>
          setTimeout(() => resolve(), getFetchIntervalWithVariance()),
        );
      }
    }
  };

  const maybeRefresh = async () => {
    const outdatedRecords = await db.platformMods
      .where("meta.lastUpdated")
      .belowOrEqual(Date.now() - CACHE_LIFESPAN)
      .toArray();

    if (outdatedRecords.length) {
      clearInterval(refreshTimer);
      refreshTimer = undefined;

      console.log(
        `Oldest data is from ${new Date(outdatedRecords[0].meta.lastUpdated ?? 0)}, need to refresh`,
        outdatedRecords,
      );
      postMessage({
        message: "Starting registry refresh...",
        progress: {
          total: outdatedRecords.length,
          complete: false,
        } satisfies DataRefreshProgressData,
      });
      await doRefresh(outdatedRecords);
      postMessage({
        message: "Finished registry refresh.",
        progress: {
          total: outdatedRecords.length,
          complete: true,
        } satisfies DataRefreshProgressData,
      });

      refreshTimer = setInterval(maybeRefresh, REFRESH_INTERVAL);
    }
  };

  maybeRefresh().then(() => {
    refreshTimer = setInterval(maybeRefresh, REFRESH_INTERVAL);
  });
};

if (typeof globalThis !== "undefined" && "Worker" in globalThis) {
  addEventListener("message", e => {
    if (e.data.init) {
      initializeTask();
      console.log("Loaded DataRegistry web worker");
    }
  });
}
