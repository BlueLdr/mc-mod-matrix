import type { ApiResponse } from "./types";

//================================================

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
      obj[key] = (promiseResults[i] as PromiseFulfilledResult<ApiResponse<T[K]>>).value.data!;
      return obj;
    }, {} as T),
    error: undefined,
  };
};
