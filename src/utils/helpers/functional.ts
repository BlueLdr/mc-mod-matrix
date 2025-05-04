import type { ApiResponse } from "~/api";

//================================================

export interface DebouncedFunc<T extends (...args: any[]) => any> {
  (...args: Parameters<T>): void;
  cancel(): void;
}

export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  delay: number
): DebouncedFunc<T> => {
  let timer: any = null;
  const invoke: DebouncedFunc<T> = (...args: Parameters<T>) => {
    if (timer) {
      clearTimeout(timer);
    }
    timer = setTimeout(() => {
      func(...args);
      timer = null;
    }, delay);
  };
  invoke.cancel = () => {
    clearTimeout(timer);
    timer = null;
  };

  return invoke;
};

export const promiseAll = async <T>(promises: {
  [K in keyof T]: Promise<ApiResponse<T[K]>>;
}): Promise<ApiResponse<T>> => {
  const keys = Object.keys(promises) as (keyof T)[];
  const promiseResults = await Promise.allSettled(Object.values(promises));
  for (const res of promiseResults) {
    if (res.status === "rejected") {
      return Promise.reject(res.reason);
    }
    /*if ((res.value as ApiResponse<any>).error) {
      return Promise.reject(res.value);
    }*/
  }
  return {
    data: keys.reduce(<K extends keyof T>(obj: T, key: K, i: number) => {
      obj[key] = (
        promiseResults[i] as PromiseFulfilledResult<ApiResponse<T[K]>>
      ).value.data!;
      return obj;
    }, {} as T),
    error: undefined,
  };
};
