import { ApiConnector } from "./api-connector";

import type { Curseforge } from "@mcmm/curseforge";

//================================================

const CURSEFORGE_BASE_URL =
  "window" in global
    ? `${window.location.origin}/api/curseforge/`
    : (process.env["MCMM_CURSEFORGE_API_URL"] ?? "https://api.curseforge.com/");
const CURSEFORGE_MC_GAME_ID = 432;

export enum CurseforgeModClass {
  mod = 6,
}

export enum CurseforgeSortField {
  featured = 1,
  popularity = 2,
}

export class CurseforgeApi extends ApiConnector {
  protected baseUrl = CURSEFORGE_BASE_URL;
  protected gameId = CURSEFORGE_MC_GAME_ID;

  public override fetch(
    path: string,
    params?: URLSearchParams,
    request?: RequestInit,
  ): Promise<any> {
    path =
      path.startsWith("https") || path.startsWith("v2/")
        ? path
        : `v1${path.startsWith("/") ? "" : "/"}${path}`;
    return super.fetch(path, params, request);
  }

  public getVersionTypes(): Promise<{ data: Curseforge.VersionsByType[] }> {
    return this.fetch(`v2/games/${this.gameId}/versions`);
  }

  public getMinecraftGameVersions() {
    return this.fetch("/minecraft/version");
  }

  public getMinecraftLoaderVersions() {
    return this.fetch("/minecraft/modloader");
  }

  public searchMods(text: string) {
    const params = new URLSearchParams({
      gameId: `${this.gameId}`,
      index: "0",
      classId: `${CurseforgeModClass.mod}`,
      sortField: `${CurseforgeSortField.featured}`,
      pageSize: "30",
      filterText: text,
    });
    return this.fetch("https://www.curseforge.com/api/v1/mods/search", params) /*.then(
      (data: { data: CurseforgeModMetadataRaw[] }) =>
        data.data.map(({ id, slug, name, summary, thumbnailUrl, author }) => ({
          id,
          slug,
          name,
          summary,
          thumbnailUrl,
          author,
        })),
    )*/;
  }

  public getModFiles(modId: number) {
    return this.fetch(`/mods/${modId}/files`);
  }

  public getModsByIds(modIds: number[]) {
    return this.fetch("/mods", undefined, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ modIds }),
    });
  }
}

export const curseforgeApi = new CurseforgeApi();
