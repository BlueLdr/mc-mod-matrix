"use client";

import { loadStorage, setStorage } from "~/utils";

import type { DataRegistryStorageState } from "./types.ts";

//================================================

const DATA_REGISTRY_STORAGE_KEY = "data-registry";

export const storeDataRegistry = (state: DataRegistryStorageState) =>
  setStorage(DATA_REGISTRY_STORAGE_KEY, state);
export const loadDataRegistry = () =>
  loadStorage<DataRegistryStorageState>(DATA_REGISTRY_STORAGE_KEY, {
    lastRefresh: 0,
    registry: {},
    /*curseforgeVersionTypeRegistry: {
      raw: [],
    },*/
  });
