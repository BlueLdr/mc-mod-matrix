import type { Platform, VersionSet } from "@mcmm/data";

//================================================

// eslint-disable-next-line @typescript-eslint/no-empty-object-type,@typescript-eslint/no-empty-interface
export interface PlatformModExtraData {}

export type ExtraDataForPlatform<T extends Platform> =
  PlatformModExtraData extends Record<T, infer Data> ? Data : never;

export type GetModVersionsResponse<T extends Platform> = {
  versions: VersionSet;
  extraData?: ExtraDataForPlatform<T>;
};

export type GetModVersionsAggregateResponse = {
  versions: VersionSet;
  extraData?: PlatformModExtraData;
};
