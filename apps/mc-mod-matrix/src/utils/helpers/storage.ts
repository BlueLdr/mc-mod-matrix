"use client";

interface LoadStorageFunction {
  <T>(key: string, def?: never): T | undefined;

  <T>(key: string, def: T): T;
}

export const loadStorage: LoadStorageFunction = <T>(key: string, def?: T): T | undefined => {
  if (!("window" in global)) {
    return def;
  }
  const stored = localStorage.getItem(key);
  if (stored) {
    try {
      const parsed = JSON.parse(stored);
      if (parsed === undefined || (parsed === "" && def !== undefined && typeof def !== "string")) {
        return def;
      }
      return parsed;
    } catch {
      return def;
    }
  }
  return def;
};

export const setStorage = (key: string, value: any) => {
  if (value == null || value === "") {
    localStorage.removeItem(key);
  } else {
    localStorage.setItem(key, JSON.stringify(value));
  }
};
