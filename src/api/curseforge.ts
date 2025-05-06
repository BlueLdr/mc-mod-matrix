import type { CurseforgeModDataRaw } from "~/data";

//================================================

export const CURSEFORGE_BASE_URL = "https://www.curseforge.com/api/v1";
export const CURSEFORGE_MC_GAME_ID = 432;

export enum CurseforgeModClass {
  mod = 6,
}

export enum CurseforgeSortField {
  featured = 1,
  popularity = 2,
}

export class CurseforgeApi {
  private baseUrl = CURSEFORGE_BASE_URL;
  private gameId = CURSEFORGE_MC_GAME_ID;

  public fetch(path: string, params?: URLSearchParams) {
    const url = new URL(
      `${this.baseUrl}${path.startsWith("/") ? "" : "/"}${path}`,
    );
    url.search = params?.toString() ?? "";
    return fetch(url).then(response => response.json());
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
    return this.fetch("/mods/search", params).then(
      (data: { data: CurseforgeModDataRaw[] }) =>
        data.data.map(({ id, slug, name, summary, thumbnailUrl, author }) => ({
          id,
          slug,
          name,
          summary,
          thumbnailUrl,
          author,
        })),
    );
  }
}

export const curseforgeApi = new CurseforgeApi();
