import { Curseforge } from "@mcmm/curseforge";

import { ApiConnector } from "./api-connector";

import type { ModLoader } from "@mcmm/data";
import type { Scalar } from "@mcmm/types";

//================================================

const CURSEFORGE_BASE_URL =
  "window" in global
    ? `${window.location.origin}/api/curseforge/`
    : (process.env["MCMM_CURSEFORGE_API_URL"] ?? "https://api.curseforge.com/");
const CURSEFORGE_MC_GAME_ID = 432;

export class CurseforgeApi extends ApiConnector {
  protected baseUrl = CURSEFORGE_BASE_URL;
  protected gameId = CURSEFORGE_MC_GAME_ID;

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
  public getVersionTypes(gameId: number) {
    return this.fetch<{ data: Curseforge.GameVersionType[] }>(`/games/${gameId}/version-types`);
  }

  /** Get all available versions for each known version type of the specified game. */
  public getGameVersions() {
    return this.fetch<{ data: Curseforge.VersionsByType[] }>(`v2/games/${this.gameId}/versions`);
  }

  //================ CATEGORIES ====================

  /** Get all available classes and categories of the specified game. */
  public getCategories(gameId: number, classId?: number) {
    return this.fetch<{ data: Curseforge.Category[] }>(
      "/v1/categories",
      this.buildSearchParams({
        gameId,
        classId,
      }),
    );
  }

  //=================== MODS =======================

  /** Get all mods that match the search criteria. */
  public searchMods(text: string, params: Curseforge.SearchModsParams = {}) {
    const searchParams = this.buildSearchParams({
      classId: Curseforge.ModClass.mod,
      sortField: Curseforge.ModsSearchSortField.Featured,
      index: 0,
      pageSize: 30,
      ...params,
      gameId: this.gameId,
      searchFilter: text,
    } satisfies Curseforge.SearchModsParams);
    if (params.gameVersions?.length) {
      searchParams.set("gameVersions", `[${params.gameVersions.map(v => `"${v}"`).join(",")}]`);
    }

    return this.fetch<Curseforge.SearchModsResponse>(
      "https://www.curseforge.com/api/v1/mods/search",
      searchParams,
    );
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
      data: Curseforge.Mod[];
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
}

export const curseforgeApi = new CurseforgeApi();
