import { ApiConnector } from "./abstract-api";

import type { GameVersion, ModMetadata, Modrinth, ModrinthModMetadataRaw } from "~/data";

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
    return this.fetch("/search", params).then((data: { hits: ModrinthModMetadataRaw[] }) =>
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
    );
  }

  public getDetailsForMods(mods: ModMetadata[]): Promise<Modrinth.Project[]> {
    const params = new URLSearchParams({
      ids: JSON.stringify(mods.map(mod => mod.modrinth?.project_id).filter(id => !!id)),
    });
    return this.fetch("/projects", params);
  }

  public getModVersions(projectIdOrSlug: string): Promise<Modrinth.Version[]> {
    return this.fetch(`/project/${projectIdOrSlug}/version`);
  }

  public getDetailsForFiles(versionIds: string[]): Promise<Modrinth.Version[]> {
    const params = new URLSearchParams({
      ids: JSON.stringify(versionIds),
    });
    return this.fetch("/versions", params);
  }

  public getGameVersions() {
    return this.fetch("/tag/game_version").then(
      (data: { version: string; version_type: string }[]) =>
        data
          .filter(item => item.version_type === "release")
          .map(item => item.version as GameVersion),
    );
  }
}

export const modrinthApi = new ModrinthApi();
