import { useCallback, useMemo } from "react";

import { debounce } from "~/utils";

//================================================

export const useDebounce = <T extends (...args: any[]) => any>(
  func: T,
  delay: number
) => useMemo(() => debounce(func, delay), [func, delay]);

export const useDebouncedCallback = <T extends (...args: any[]) => any>(
  func: T,
  inputs: any[] = [],
  delay: number
) => {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const callback = useCallback(func, inputs);
  return useDebounce<T>(callback, delay);
};
