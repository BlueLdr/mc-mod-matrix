import type { ApiResponse } from "./types";

//================================================

export type PromiseMap<T> = {
  [K in keyof T]: Promise<ApiResponse<T[K]>>;
};

export const promiseAll = async <T>(promises: PromiseMap<T>): Promise<ApiResponse<T>> => {
  const isArray = Array.isArray(promises);
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
    data: keys.reduce(
      <K extends keyof T>(obj: T, key: K, i: number) => {
        obj[isArray ? (Number(key) as K) : key] = (
          promiseResults[i] as PromiseFulfilledResult<ApiResponse<T[K]>>
        ).value.data!;
        return obj;
      },
      (isArray ? [] : {}) as T,
    ),
    error: undefined,
  };
};
