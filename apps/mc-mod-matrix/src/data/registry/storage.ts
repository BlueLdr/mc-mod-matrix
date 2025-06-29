"use client";

import Dexie from "dexie";

import { loadStorage, setStorage } from "~/utils";

import type { DataRegistryDb, DataRegistryStorageState } from "./types";

//================================================

const DATA_REGISTRY_STORAGE_KEY = "data-registry";

export const storeDataRegistry = (state: DataRegistryStorageState) =>
  setStorage(DATA_REGISTRY_STORAGE_KEY, state);
export const loadDataRegistry = () =>
  loadStorage<DataRegistryStorageState>(DATA_REGISTRY_STORAGE_KEY, {
    lastRefresh: 0,
  });

export const loadDataRegistryDb = () => {
  const dataRegistryDb = new Dexie("DataRegistry") as DataRegistryDb;

  dataRegistryDb.version(1).stores({
    registry: "&id, dateModified, minGameVersionFetched",
  });
  dataRegistryDb.open().catch(e => console.error(e));

  return dataRegistryDb;
};
