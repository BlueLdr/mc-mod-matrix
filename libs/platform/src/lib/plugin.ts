"use client";

import * as JSZip from "jszip";

import { gameVersionComparator } from "@mcmm/utils";

import type { AtLeastOneRequired } from "@mcmm/types";
import type { ApiResponse } from "@mcmm/api";
import type { GameVersion, ModLoader, Platform, PlatformModMetadata } from "@mcmm/data";
import type {
  ExtraDataForPlatform,
  GetModVersionsResponse,
  ModpackExportParams,
  PlatformPluginTypes,
  PlatformPluginTypesTemplate,
} from "./types";

//================================================

export abstract class PlatformPlugin<
  P extends Platform,
  PluginTypes extends Record<P, PlatformPluginTypesTemplate<unknown, unknown, unknown>> &
    PlatformPluginTypes,
> {
  public abstract readonly platformName: P;
  public abstract readonly modUrlBase: string;
  public abstract readonly idType: "string" | "number";
  public abstract readonly manifestFilename: string;
  static allGameVersions: GameVersion[] | undefined;

  static getVersionRange({ min, max }: AtLeastOneRequired<{ min: GameVersion; max: GameVersion }>) {
    if (!PlatformPlugin.allGameVersions) {
      return [];
    }
    const versions = PlatformPlugin.allGameVersions.slice().sort(gameVersionComparator).reverse();
    return versions.filter(
      version =>
        (!max || gameVersionComparator(version, max) <= 0) &&
        (!min || gameVersionComparator(version, min) >= 0),
    );
  }

  public abstract toModMetadata(
    record: PluginTypes[P]["meta"],
  ): PlatformModMetadata<P, PluginTypes[P]["id"]>;

  public abstract fromModMetadata(
    meta: PlatformModMetadata<P, PluginTypes[P]["id"]>,
  ): PluginTypes[P]["meta"];

  public abstract searchMods(search: string): Promise<ApiResponse<PluginTypes[P]["meta"][]>>;

  public abstract getModVersions(
    meta: PlatformModMetadata<P>,
    minGameVersion: GameVersion,
    extraData?: ExtraDataForPlatform<P>,
  ): Promise<ApiResponse<GetModVersionsResponse<P>>>;

  public abstract getLatestFileForMod(
    modId: PluginTypes[P]["id"],
    gameVersion: GameVersion,
    loader: ModLoader,
  ): Promise<ApiResponse<PluginTypes[P]["file"]>>;

  public static readonly NO_FILE_FOR_MOD_VERSION_ERROR_CODE =
    "FILE_NOT_FOUND_FOR_MOD_VERSION_ERROR";

  public abstract getDependencyModIdsFromFile(file: PluginTypes[P]["file"]): PluginTypes[P]["id"][];

  public abstract createModpackManifest(
    params: Omit<ModpackExportParams, "platform"> & {
      files: PluginTypes[P]["file"][];
    },
  ): PluginTypes[P]["manifest"];

  public generateModpackFile(manifest: PluginTypes[P]["manifest"]) {
    const zip = (JSZip as unknown as () => JSZip)();
    zip.file(this.manifestFilename, JSON.stringify(manifest, null, "  "));
    const overrides = zip.folder("overrides");
    overrides?.folder("mods");

    return zip.generateAsync({ type: "blob" });
  }
}
