import { pick } from "lodash";

import { Platform, VersionSet } from "@mcmm/data";

import { modrinthApi } from "./lib/api";

import type { ModLoader, PlatformModMetadata } from "@mcmm/data";
import type { ApiResponse } from "@mcmm/api";
import type { PlatformPlugin } from "@mcmm/platform";
import type * as Modrinth from "./lib/types";

//================================================

export type ModrinthPlatformModMetadata = Pick<
  Modrinth.SearchResult,
  "project_id" | "slug" | "author" | "title" | "description" | "icon_url"
>;

export class ModrinthPlatformPlugin
  implements PlatformPlugin<ModrinthPlatformModMetadata, ModrinthPlatformModMetadata["project_id"]>
{
  platformName = Platform.Modrinth;
  modUrlBase = "https://modrinth.com/mod/";
  idType = "string" as const;

  toModMetadata = (
    record: ModrinthPlatformModMetadata,
  ): PlatformModMetadata<ModrinthPlatformModMetadata["project_id"]> => {
    return {
      platform: this.platformName,
      id: record.project_id,
      slug: record.slug,
      authorName: record.author,
      authorId: record.author,
      modName: record.title,
      modDescription: record.description,
      thumbnailUrl: record.icon_url ?? "",
    };
  };

  fromModMetadata(
    meta: PlatformModMetadata<ModrinthPlatformModMetadata["project_id"]>,
  ): ModrinthPlatformModMetadata {
    return {
      project_id: meta.id,
      slug: meta.slug,
      author: meta.authorName,
      title: meta.modName,
      description: meta.modDescription,
      icon_url: meta.thumbnailUrl,
    };
  }

  searchMods(searchText: string) {
    return modrinthApi.searchMods(searchText).then(({ data, error }) => {
      if (error) {
        return { data: null, error };
      }
      return { data: data.hits?.map(this.makeMetaFromSearchResult), error: null };
    });
  }

  getModVersions(
    meta: PlatformModMetadata<ModrinthPlatformModMetadata["project_id"]>,
  ): Promise<ApiResponse<VersionSet>> {
    return modrinthApi.getModVersions(meta.id).then(({ data, error }) => {
      if (error) {
        return { data: null, error };
      }
      const versionSet = new VersionSet();
      data.forEach(projectVersion => {
        projectVersion.game_versions.forEach(gameVersion => {
          (projectVersion.loaders as ModLoader[]).forEach(loader => {
            versionSet.push({
              gameVersion,
              loader,
              platform: this.platformName,
            });
          });
        });
      });
      return { data: versionSet, error: null };
    });
  }

  //================================================

  private makeMetaFromSearchResult(data: Modrinth.SearchResult): ModrinthPlatformModMetadata {
    return pick(data, "project_id", "slug", "author", "title", "description", "icon_url");
  }
}
