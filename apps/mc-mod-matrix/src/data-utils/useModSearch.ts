"use client";

import { debounce } from "lodash";
import { useCallback, useContext, useEffect, useMemo, useState } from "react";
import useSWR from "swr";

import { DataRegistryContext } from "~/context";
import { isSameMod, platformManager } from "~/data";

import type { Platform } from "@mcmm/data";

//================================================

export interface UseModSearchOptions {
  debounceDelay?: number;
  platforms?: Platform[];
}

export const useModSearch = ({ debounceDelay, platforms }: UseModSearchOptions = {}) => {
  const [inputValue, setInputValue] = useState("");
  const [searchString, setSearchString] = useState("");
  const { dataRegistry } = useContext(DataRegistryContext);
  const searchMods = useCallback(
    (text: string) =>
      platformManager.searchMods(
        text,
        isSameMod,
        async meta => await dataRegistry?.helper.getModByPlatformMeta(meta),
        platforms,
      ),
    [dataRegistry, platforms],
  );

  const { data, isLoading, error } = useSWR(searchString || null, searchMods, {
    keepPreviousData: true,
  });

  const status = useMemo(
    () => ({
      pending: isLoading,
      error,
      success: !isLoading && !error && !data?.error,
    }),
    [data?.error, error, isLoading],
  );

  const resetSearch = useCallback(() => {
    setInputValue("");
    setSearchString("");
  }, []);

  const debouncedSearch = useMemo(() => debounce(setSearchString, 500, { trailing: true }), []);
  useEffect(() => {
    if (inputValue.trim()) {
      debouncedSearch(inputValue.trim());
    }
  }, [debouncedSearch, inputValue]);

  const value = debounceDelay === 0 ? searchString : inputValue;
  const setValue = debounceDelay === 0 ? setSearchString : setInputValue;

  return [value, setValue, data?.data, status, resetSearch] as const;
};
