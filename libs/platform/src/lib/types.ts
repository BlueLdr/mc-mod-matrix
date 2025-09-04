import type { PackSupportMeta, Platform, RawModLoaderVersionString, VersionSet } from "@mcmm/data";

//================================================

// eslint-disable-next-line @typescript-eslint/no-empty-object-type,@typescript-eslint/no-empty-interface
export interface PlatformPluginTypes {}

export type PluginTypesForPlatform<T extends Platform> =
  PlatformPluginTypes extends Record<T, infer Types> ? Types : never;

export interface PlatformPluginTypesTemplate<
  PlatformMeta,
  PlatformFile,
  PlatformManifest,
  IdType extends string | number = string | number,
> {
  meta: PlatformMeta;
  file: PlatformFile;
  manifest: PlatformManifest;
  id: IdType;
}

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

export interface ModpackExportParams {
  platform: Platform;
  packSupportMeta: PackSupportMeta;
  modLoaderVersion: RawModLoaderVersionString;
  version: string;
  author: string;
  fileName: string;
}
