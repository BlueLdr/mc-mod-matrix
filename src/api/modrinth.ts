import type { ModrinthModDataRaw } from "~/data";

//================================================

const MODRINTH_BASE_URL = "https://api.modrinth.com/v2";

export enum ModrinthSortIndex {
  relevance = "relevance",
  downloads = "downloads",
}

export enum ModrinthFacet {
  mod = '["project_type:mod"]',
}

export class ModrinthApi {
  private baseUrl = MODRINTH_BASE_URL;

  public fetch(path: string, params?: URLSearchParams) {
    const url = new URL(
      `${this.baseUrl}${path.startsWith("/") ? "" : "/"}${path}`,
    );
    url.search = params?.toString() ?? "";
    return fetch(url).then(response => response.json());
  }

  public searchMods(text: string) {
    const params = new URLSearchParams({
      facets: `[${ModrinthFacet.mod}]`,
      index: `${ModrinthSortIndex.relevance}`,
      limit: "30",
      query: text,
    });
    return this.fetch("/search", params).then(
      (data: { hits: ModrinthModDataRaw[] }) =>
        data.hits.map(
          ({
            project_id,
            slug,
            title,
            description,
            icon_url,
            author,
          }): ModrinthModDataRaw => ({
            project_id,
            slug,
            title,
            description,
            icon_url,
            author,
          }),
        ),
    );
  }

  public getGameVersions() {
    return this.fetch("/tag/game_version").then(
      (data: { version: string; version_type: string }[]) =>
        data
          .filter(item => item.version_type === "release")
          .map(item => item.version),
    );
  }
}

export const modrinthApi = new ModrinthApi();
