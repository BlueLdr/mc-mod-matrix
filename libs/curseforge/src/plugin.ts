import { Platform, VersionSet } from "@mcmm/data";

import { curseforgeApi } from "./lib/api";

import type { GameVersion, ModVersionData, PlatformModMetadata } from "@mcmm/data";
import type { PlatformPlugin } from "@mcmm/platform";
import type { ApiResponse } from "@mcmm/api";
import type * as Curseforge from "./lib/types";

//================================================

export type CurseforgePlatformModMetadata = Pick<
  Curseforge.SearchResult,
  "id" | "slug" | "name" | "summary" | "thumbnailUrl"
> & {
  author: Pick<Curseforge.SearchResult["author"], "id" | "name">;
};

export class CurseforgePlatformPlugin
  implements PlatformPlugin<CurseforgePlatformModMetadata, CurseforgePlatformModMetadata["id"]>
{
  platformName = Platform.Curseforge;
  modUrlBase = "https://www.curseforge.com/minecraft/mc-mods/";

  toModMetadata = (
    record: CurseforgePlatformModMetadata,
  ): PlatformModMetadata<CurseforgePlatformModMetadata["id"]> => {
    return {
      platform: this.platformName,
      id: record.id,
      slug: record.slug,
      authorName: record.author.name,
      authorId: record.author.id,
      modName: record.name,
      modDescription: record.summary,
      thumbnailUrl: record.thumbnailUrl,
    };
  };

  fromModMetadata(
    meta: PlatformModMetadata<CurseforgePlatformModMetadata["id"]>,
  ): CurseforgePlatformModMetadata {
    return {
      id: meta.id,
      slug: meta.slug,
      author: { id: meta.authorId, name: meta.authorName },
      name: meta.modName,
      summary: meta.modDescription,
      thumbnailUrl: meta.thumbnailUrl,
    };
  }

  searchMods(searchText: string): Promise<ApiResponse<CurseforgePlatformModMetadata[]>> {
    return curseforgeApi.searchMods(searchText).then(({ data, error }) => {
      if (error) {
        return { data: null, error };
      }
      return {
        data: data.data.map(this.makeMetaFromSearchResult),
        error: null,
      };
    });
  }

  getModVersions(
    meta: PlatformModMetadata<CurseforgePlatformModMetadata["id"]>,
    minGameVersion: GameVersion,
  ): Promise<ApiResponse<VersionSet<ModVersionData>>> {
    return curseforgeApi.getModVersions(meta.id, minGameVersion).then(({ data, error }) => {
      if (error) {
        return { data: null, error };
      }
      return {
        data: new VersionSet(
          ...data.map<ModVersionData>(version => ({
            ...version,
            platform: this.platformName,
            id: meta.id,
            slug: meta.slug,
            image: meta.thumbnailUrl,
          })),
        ),
      };
    });
  }

  //================================================

  private makeMetaFromSearchResult(data: Curseforge.SearchResult): CurseforgePlatformModMetadata {
    return {
      id: data.id,
      slug: data.slug,
      author: { id: data.author.id, name: data.author.name },
      name: data.name,
      summary: data.summary,
      thumbnailUrl: data.thumbnails?.thumbnailUrl64 ?? data.thumbnailUrl,
    };
  }
}
