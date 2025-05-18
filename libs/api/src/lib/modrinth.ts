import { ApiConnector } from "./api-connector";

import type { Modrinth } from "@mcmm/modrinth";

//================================================

const MODRINTH_BASE_URL = "https://api.modrinth.com/v2";

export enum ModrinthSortIndex {
  relevance = "relevance",
  downloads = "downloads",
}

export enum ModrinthFacet {
  mod = '["project_type:mod"]',
}

export class ModrinthApi extends ApiConnector {
  protected baseUrl = MODRINTH_BASE_URL;

  public searchMods(text: string) {
    const params = new URLSearchParams({
      facets: `[${ModrinthFacet.mod}]`,
      index: `${ModrinthSortIndex.relevance}`,
      limit: "30",
      query: text,
    });
    return this.fetch<{ hits: Modrinth.SearchResult[] }>(
      "/search",
      params,
    ); /*.then((data: { hits: Modrinth.SearchResult[] }) =>
      data.hits.map(
        ({ project_id, slug, title, description, icon_url, author }): ModrinthModMetadataRaw => ({
          project_id,
          slug,
          title,
          description,
          icon_url,
          author,
        }),
      ),
    );*/
  }

  public getDetailsForMods(projectIds: (string | null | undefined)[]) {
    const params = new URLSearchParams({
      ids: JSON.stringify(projectIds.filter(id => !!id)),
    });
    return this.fetch<Modrinth.Project[]>("/projects", params);
  }

  public getModVersions(projectIdOrSlug: string) {
    return this.fetch<Modrinth.Version[]>(`/project/${projectIdOrSlug}/version`);
  }

  public getDetailsForFiles(versionIds: string[]) {
    const params = new URLSearchParams({
      ids: JSON.stringify(versionIds),
    });
    return this.fetch<Modrinth.Version[]>("/versions", params);
  }

  public getGameVersions() {
    return this.fetch("/tag/game_version") /*.then(
      (data: { version: string; version_type: string }[]) =>
        data
          .filter(item => item.version_type === "release")
          .map(item => item.version as GameVersion),
    )*/;
  }
}

export const modrinthApi = new ModrinthApi();
