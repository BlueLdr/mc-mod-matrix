import { createContext, useCallback, useEffect, useMemo, useState } from "react";

import { loadStorage, setStorage } from "~/utils";

import type { WithChildren } from "~/utils";
import type { Modpack } from "~/data";
import type { StoredDataState } from "./types";

//================================================

const STORAGE_KEY = "storage";

const storedList = loadStorage(STORAGE_KEY, {});
const initialSet = new Map<string, Modpack>(
  typeof storedList === "object" ? Object.entries(storedList) : [],
);

export const DataContext = createContext<StoredDataState>({
  list: initialSet,
  add: () => {},
  remove: () => {},
});

//================================================

export const DataProvider: React.FC<WithChildren> = ({ children }) => {
  const [data, setData] = useState(initialSet);

  const addFavorite = useCallback((value: Modpack) => {
    setData(curValue => {
      if (curValue.has(value.name)) {
        return curValue;
      }
      const newSet = new Map(curValue);
      newSet.set(value.name, value);
      return newSet;
    });
  }, []);

  const removeFavorite = useCallback((value: string | Modpack) => {
    setData(curValue => {
      const id = typeof value === "string" ? value : value.name;
      if (!curValue.has(id)) {
        return curValue;
      }
      const newSet = new Map(curValue);
      newSet.delete(id);
      return newSet;
    });
  }, []);

  const value = useMemo(
    () => ({
      list: data,
      add: addFavorite,
      remove: removeFavorite,
    }),
    [addFavorite, data, removeFavorite],
  );

  useEffect(() => {
    setStorage(STORAGE_KEY, Object.fromEntries(data.entries()));
  }, [data]);

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};
