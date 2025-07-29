import { values } from "lodash";

import { ApiConnector, promiseAll } from "@mcmm/api";
import { ModLoader, Platform, VersionSet } from "@mcmm/data";
import { awaitTimeout, gameVersionComparator, gameVersionRegex } from "@mcmm/utils";
import { createDisplayableError } from "@mcmm/types";

import * as Curseforge from "./types";

import type { Scalar } from "@mcmm/types";
import type { GameVersion } from "@mcmm/data";
import type { ApiResponse } from "@mcmm/api";
import type { GetModVersionsResponse } from "@mcmm/platform";
import type { CurseforgeCachedVersionFetchData, CurseforgePlatformModExtraData } from "../types";

//================================================

type GetVersionsForLoaderResponse = { versions: string[] } & CurseforgeCachedVersionFetchData;

type GetVersionsPrevData = CurseforgeCachedVersionFetchData & {
  minVersion: GameVersion;
};

const CURSEFORGE_BASE_URL =
  typeof globalThis !== "undefined" && ("window" in globalThis || "location" in globalThis)
    ? `${location.origin}/api/curseforge/`
    : (process.env["MCMM_CURSEFORGE_API_URL"] ?? "https://api.curseforge.com/");

export class CurseforgeApi extends ApiConnector {
  constructor() {
    super();
    this.gameVersionReleaseDates = {};
    this.gameVersionPreReleaseDates = {};
    if (
      typeof globalThis === "undefined" ||
      !("window" in globalThis || "location" in globalThis)
    ) {
      return;
    }
    this.getMinecraftGameVersions().then(result => {
      result?.data?.data.forEach(version => {
        if (gameVersionRegex.test(version.versionString)) {
          this.gameVersionPreReleaseDates[version.versionString] = new Date(
            version.dateModified,
          ).getTime();
        }
      });
    });
  }

  protected baseUrl = CURSEFORGE_BASE_URL;
  protected gameId = 432;

  private gameVersionReleaseDates: Record<GameVersion, number>;
  private gameVersionPreReleaseDates: Record<GameVersion, number>;

  private getGameVersionRange = (min: GameVersion, max?: GameVersion) => {
    return Object.keys(this.gameVersionPreReleaseDates).filter(
      version =>
        (!max || gameVersionComparator(version, max) < 0) &&
        gameVersionComparator(version, min) >= 0,
    );
  };

  private getVersionReleaseDate(version: GameVersion) {
    return this.gameVersionReleaseDates[version] ?? this.gameVersionPreReleaseDates[version] ?? 0;
  }

  public override fetch<T>(path: string, params?: URLSearchParams, request?: RequestInit) {
    path =
      path.startsWith("https") || path.startsWith("v2/")
        ? path
        : `v1${path.startsWith("/") ? "" : "/"}${path}`;
    return super.fetch<T>(path, params, request);
  }

  private buildSearchParams = <T extends Record<string, Scalar | Scalar[] | null | undefined>>(
    obj: T,
  ) => {
    const params = new URLSearchParams();
    Object.entries(obj).forEach(([key, value]) => {
      if (value == null || value === "" || (Array.isArray(value) && value.length === 0)) {
        return;
      }
      if (!Array.isArray(value)) {
        params.set(key, `${value}`);
      } else {
        params.set(key, `[${value.join(",")}]`);
      }
    });
    return params;
  };

  //================================================
  //=============== API ENDPOINTS ==================
  //================================================

  //=================== GAMES ======================

  // getGames - not needed
  // getGame - not needed
  // getVersions (v1) - not needed

  /** Get all available version types of the specified game. */
  public getVersionTypes(/*gameId: number*/) {
    return this.fetch<{ data: Curseforge.GameVersionType[] }>(
      `/games/${this.gameId}/version-types`,
    );
  }

  /** Get all available versions for each known version type of the specified game. */
  public getGameVersions() {
    return this.fetch<{ data: Curseforge.VersionsByType[] }>(`v2/games/${this.gameId}/versions`);
  }

  //================ CATEGORIES ====================

  /** Get all available classes and categories of the specified game. */
  public getCategories(/*gameId: number,*/ classId?: number) {
    return this.fetch<{ data: Curseforge.Category[] }>(
      "/v1/categories",
      this.buildSearchParams({
        gameId: this.gameId,
        classId,
      }),
    );
  }

  //=================== MODS =======================

  /** Get all mods that match the search criteria. */
  public searchMods(text: string, params: Curseforge.SearchModsParams = {}) {
    const searchParams = this.buildSearchParams({
      classId: Curseforge.ModClassEnum.mod,
      sortField: Curseforge.ModsSearchSortField.Featured,
      index: 0,
      pageSize: 30,
      ...params,
      gameId: this.gameId,
      filterText: text,
    } satisfies Curseforge.SearchModsParams);
    if (params.gameVersions?.length) {
      searchParams.set("gameVersions", `[${params.gameVersions.map(v => `"${v}"`).join(",")}]`);
    }

    return this.fetch<Curseforge.SearchModsResponse>("/mods/search", searchParams);
  }

  /** Get a single mod. */
  public getMod(modId: number) {
    return this.fetch<{ data: Curseforge.Mod }>(`/mods/${modId}`);
  }

  /** Get a list of mods belonging the same game. */
  public getModsByIds(modIds: number[]) {
    return this.fetch<{ data: Curseforge.Mod[] }>("/mods", undefined, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ modIds }),
    });
  }

  // getFeaturedMods - not needed
  // getModDescription - not needed

  //=================== FILES ======================

  /** Get a single file of the specified mod. */
  public getModFile(modId: number, fileId: number) {
    return this.fetch<{ data: File }>(`/mods/${modId}/files/${fileId}`);
  }

  /** Get all files of the specified mod. */
  public getModFiles(modId: number, params: Curseforge.GetModFilesParams = {}) {
    const searchParams = this.buildSearchParams({ ...params });
    return this.fetch<{
      data: Curseforge.File[];
      pagination: Curseforge.Pagination;
    }>(`/mods/${modId}/files`, searchParams);
  }

  // getFiles - not needed
  // getModFileChangelog - not needed
  // getModFileDownloadUrl - not needed

  //================= MINECRAFT ===================

  public getMinecraftGameVersions(ascending?: boolean) {
    return this.fetch<{
      data: Curseforge.MinecraftGameVersion[];
    }>("/minecraft/version", new URLSearchParams({ sortDescending: `${!ascending}` }));
  }

  public getMinecraftLoaderVersions(params: Curseforge.GetModLoadersParams = {}) {
    return this.fetch<{
      data: Curseforge.MinecraftModLoaderIndex[];
    }>("/minecraft/modloader", this.buildSearchParams({ ...params }));
  }

  public getMinecraftLoader(loader: ModLoader) {
    return this.fetch<{ data: Curseforge.MinecraftModLoaderVersion }>(
      `/minecraft/modloader/${loader}`,
    );
  }

  //================= CUSTOM ======================

  public getModVersions(
    modId: number,
    minGameVersion: GameVersion,
    prevMinGameVersion?: GameVersion,
    prevExtraData?: CurseforgePlatformModExtraData,
  ): Promise<ApiResponse<GetModVersionsResponse<Platform.Curseforge>>> {
    if (!minGameVersion) {
      return Promise.resolve({
        error: createDisplayableError("Missing required parameter `gameVersions`"),
        data: null,
      });
    }
    return promiseAll(
      values(ModLoader).reduce<
        Partial<Record<ModLoader, Promise<ApiResponse<GetVersionsForLoaderResponse>>>>
      >((obj, loader) => {
        obj[loader] = this.getModVersionsForLoader(
          modId,
          loader,
          minGameVersion,
          prevExtraData?.[loader] && prevMinGameVersion
            ? {
                ...prevExtraData[loader],
                minVersion: prevMinGameVersion,
              }
            : undefined,
        );
        return obj;
      }, {} as any),
    ).then(response => {
      if (!response.data) {
        return response;
      }
      const results = new VersionSet();
      // @ts-expect-error: initially empty
      const newExtraData: CurseforgePlatformModExtraData = {};
      Object.entries(response.data).forEach(
        ([loader, { versions, lastPageFetched, newestFileDate }]) => {
          newExtraData[loader as ModLoader] = {
            newestFileDate: Math.max(
              newestFileDate,
              prevExtraData?.[loader as ModLoader]?.newestFileDate ?? 0,
            ),
            lastPageFetched: Math.max(
              lastPageFetched ?? 0,
              prevExtraData?.[loader as ModLoader]?.lastPageFetched ?? 0,
            ),
          };

          versions
            .slice()
            .sort(gameVersionComparator)
            .forEach(gameVersion => {
              results.push({
                loader: loader as ModLoader,
                gameVersion,
                platform: Platform.Curseforge,
              });
            });
        },
      );
      return {
        data: {
          versions: results,
          extraData: newExtraData,
        },
      };
    });
  }

  public async getModVersionsForLoader(
    modId: number,
    loader: ModLoader,
    minVersion: GameVersion,
    prevData: GetVersionsPrevData | undefined,
  ): Promise<ApiResponse<GetVersionsForLoaderResponse>> {
    let page = 0;
    let newestFileDate = prevData?.newestFileDate ?? 0;
    let oldestFileDate = Infinity;
    let allNewerDataHasBeenFetched = false;
    let hasPassedReleaseDateOfOldestVersionNeeded = false;

    const versions = new Set<GameVersion>();
    // if we're fetching for a version <= the prev min fetched version
    const versionsNeeded =
      !prevData || gameVersionComparator(minVersion, prevData.minVersion) < 0
        ? new Set(this.getGameVersionRange(minVersion, prevData?.minVersion))
        : undefined;

    let shouldStop = false;
    do {
      const result = await this.getModFiles(modId, {
        modLoaderType: Curseforge.ModLoaderType[loader],
        index: page,
      });
      if (!result.data) {
        return result;
      }

      for (const file of result.data.data) {
        const thisGameVersions = file.sortableGameVersions.filter(v => !!v.gameVersion);

        thisGameVersions.forEach(v => {
          const gameVersion = v.gameVersion;
          versions.add(gameVersion);
          versionsNeeded?.delete(gameVersion);

          if (!this.gameVersionReleaseDates[gameVersion]) {
            this.gameVersionReleaseDates[gameVersion] = new Date(
              v.gameVersionReleaseDate,
            ).getTime();
          }
        });

        const fileDate = new Date(file.fileDate).getTime();
        newestFileDate = Math.max(fileDate, newestFileDate ?? 0);
        oldestFileDate = Math.min(fileDate, oldestFileDate ?? 0);
      }

      const isLastPage =
        (page + 1) * result.data.pagination.pageSize >= result.data.pagination.totalCount;
      const foundAllVersions = versionsNeeded?.size === 0;
      if (isLastPage || foundAllVersions) {
        shouldStop = true;
        break;
      }

      if (prevData != null && !allNewerDataHasBeenFetched) {
        allNewerDataHasBeenFetched = oldestFileDate < prevData.newestFileDate;
      }

      if (allNewerDataHasBeenFetched && !versionsNeeded) {
        shouldStop = true;
        break;
      }

      if (versionsNeeded?.size) {
        const versionsNeededArr = versionsNeeded ? Array.from(versionsNeeded) : [];

        const oldestVersionNotFoundReleaseDate = versionsNeededArr.length
          ? Math.min(...versionsNeededArr.map(ver => this.getVersionReleaseDate(ver)))
          : undefined;

        if (oldestVersionNotFoundReleaseDate) {
          hasPassedReleaseDateOfOldestVersionNeeded =
            oldestFileDate < oldestVersionNotFoundReleaseDate;
        }
      }

      if ((!prevData || allNewerDataHasBeenFetched) && hasPassedReleaseDateOfOldestVersionNeeded) {
        shouldStop = true;
        break;
      }

      page =
        // if we're done looking for new data, and we still have versions to find, then skip to the
        // previous lastPageFetched.
        allNewerDataHasBeenFetched && prevData && page < prevData.lastPageFetched
          ? prevData.lastPageFetched
          : page + result.data.pagination.pageSize;

      await awaitTimeout(Math.random() * 500);
    } while (!shouldStop);

    return {
      data: {
        versions: Array.from(versions).sort(gameVersionComparator),
        newestFileDate,
        lastPageFetched: Math.max(page, prevData?.lastPageFetched ?? 0),
      },
    };
  }
}

export const curseforgeApi = new CurseforgeApi();
