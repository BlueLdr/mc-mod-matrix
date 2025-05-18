import { useCallback, useMemo } from "react";

import { debounce } from "@mcmm/utils";

//================================================

export const useDebounce = <T extends (...args: unknown[]) => unknown>(func: T, delay: number) =>
  useMemo(() => debounce(func, delay), [func, delay]);

export const useDebouncedCallback = <T extends (...args: unknown[]) => unknown>(
  func: T,
  inputs: unknown[] = [],
  delay: number,
) => {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const callback = useCallback(func, inputs);
  return useDebounce<T>(callback, delay);
};
