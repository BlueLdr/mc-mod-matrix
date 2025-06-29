"use client";

import Dexie from "dexie";

import type { DataRegistryDb } from "./types";

//================================================

export const loadDataRegistryDb = () => {
  const dataRegistryDb = new Dexie("DataRegistry") as DataRegistryDb;

  dataRegistryDb.version(2).stores({
    mods: "&id,dateModified,minGameVersionFetched,*platforms",
    platformMods: "&id,[meta.id+meta.platform],meta.platform,meta.id,meta.lastUpdated",
    platformModVersions: "++,modId,platform,gameVersion,loader",
  });
  dataRegistryDb.open().catch(e => console.error(e));

  return dataRegistryDb;
};
