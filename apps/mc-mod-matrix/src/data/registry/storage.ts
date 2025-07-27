"use client";

import Dexie from "dexie";

import { getUniqueIdForPlatformModMeta } from "@mcmm/data";

import type { PromiseExtended, Transaction } from "dexie";
import type { DataRegistryDb, ModDbEntry, PlatformModDbEntry } from "./types";

//================================================

const DB_VERSIONS: [
  Record<string, string | null>,
  undefined | ((tx: Transaction) => PromiseExtended),
][] = [
  [{}, undefined],

  [
    {
      mods: "&id,dateModified,minGameVersionFetched,*platforms",
      platformMods: "&id,[meta.id+meta.platform],meta.platform,meta.id,meta.lastUpdated",
      platformModVersions: "++,modId,platform,gameVersion,loader",
    },
    undefined,
  ],
  [
    {
      platformMods: "&id,&[meta.id+meta.platform],meta.platform,meta.id,meta.lastUpdated",
    },
    tx => {
      const idMapping: Record<string, string> = {};
      const updatedPlatformModEntries: PlatformModDbEntry[] = [];
      return tx
        .table("platformMods")
        .each(async (platformModEntry: PlatformModDbEntry) => {
          const newEntry = { ...platformModEntry };
          const oldId = platformModEntry.id;
          const newId = getUniqueIdForPlatformModMeta(platformModEntry.meta);
          idMapping[oldId] = newId;
          newEntry.id = newId;
          if (!platformModEntry.meta.minGameVersionFetched) {
            const mod: ModDbEntry | undefined = await tx
              .table("mods")
              .where("platforms")
              .equals(platformModEntry.id)
              .first();
            if (mod) {
              newEntry.meta.minGameVersionFetched = mod.minGameVersionFetched;
            }
          }
          updatedPlatformModEntries.push(newEntry);
        })
        .then(() => tx.table("platformMods").clear())
        .then(() => tx.table("platformMods").bulkAdd(updatedPlatformModEntries))
        .then(() =>
          tx
            .table("mods")
            .toCollection()
            .modify((mod: ModDbEntry) => {
              mod.platforms = mod.platforms.map(id => idMapping[id]);
            }),
        );
    },
  ],
] as const;

//================================================

export const loadDataRegistryDb = (preventOpen?: true) => {
  const dataRegistryDb = new Dexie("DataRegistry") as DataRegistryDb;

  DB_VERSIONS.map(([stores, upgradeCallback], index) => {
    const version = dataRegistryDb.version(index + 1).stores(stores);
    if (upgradeCallback) {
      version.upgrade(upgradeCallback);
    }
  });

  if (!preventOpen) {
    dataRegistryDb.open().catch(e => console.error(e));
  }

  return dataRegistryDb;
};
