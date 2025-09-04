import { Platform, VersionSet } from "@mcmm/data";
import { createDisplayableError } from "@mcmm/types";
import { PlatformPlugin } from "@mcmm/platform";

import { curseforgeApi } from "./lib/api";
import { FileRelationType, ModLoaderType } from "./lib/types";

import type {
  ModpackExportParams,
  GetModVersionsResponse,
  PlatformPluginTypes,
} from "@mcmm/platform";
import type { GameVersion, PlatformModMetadata, ModLoader } from "@mcmm/data";
import type { ApiResponse } from "@mcmm/api";
import type * as Curseforge from "./lib/types";
import type { CurseforgePlatformModExtraData } from "./types";

//================================================

export type CurseforgePlatformModMetadata = Pick<
  Curseforge.SearchResult,
  "id" | "slug" | "name" | "summary" | "thumbnailUrl"
> & {
  author: Pick<Curseforge.SearchResult["author"], "id" | "name">;
};

export class CurseforgePlatformPlugin
  extends PlatformPlugin<Platform.Curseforge, PlatformPluginTypes>
  implements PlatformPlugin<Platform.Curseforge, PlatformPluginTypes>
{
  platformName = Platform.Curseforge as const;
  modUrlBase = "https://www.curseforge.com/minecraft/mc-mods/";
  idType = "number" as const;
  manifestFilename = "manifest.json";

  toModMetadata = (
    record: CurseforgePlatformModMetadata,
  ): PlatformModMetadata<Platform.Curseforge, CurseforgePlatformModMetadata["id"]> => {
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
    meta: PlatformModMetadata<Platform.Curseforge, CurseforgePlatformModMetadata["id"]>,
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
    meta: PlatformModMetadata<Platform.Curseforge, CurseforgePlatformModMetadata["id"]>,
    minGameVersion: GameVersion,
    extraData?: CurseforgePlatformModExtraData,
  ): Promise<ApiResponse<GetModVersionsResponse<Platform.Curseforge>>> {
    return curseforgeApi
      .getModVersions(meta.id, minGameVersion, meta.minGameVersionFetched, extraData)
      .then(({ data, error }) => {
        if (error) {
          return { data: null, error };
        }
        return {
          data: {
            versions: new VersionSet(
              ...data.versions.map(version => ({
                ...version,
                platform: this.platformName,
              })),
            ),
            extraData: data?.extraData,
          },
        };
      });
  }

  public getLatestFileForMod(
    modId: CurseforgePlatformModMetadata["id"],
    gameVersion: GameVersion,
    loader: ModLoader,
  ): Promise<ApiResponse<Curseforge.File>> {
    return curseforgeApi
      .getModFiles(modId, { gameVersion, modLoaderType: ModLoaderType[loader] })
      .then(({ data, error }) => {
        if (error || !data?.data?.length) {
          if (!error) {
            error = createDisplayableError(
              new Error(`No files found for mod ${modId} / ${gameVersion} / ${loader}`),
            );
            error.code = PlatformPlugin.NO_FILE_FOR_MOD_VERSION_ERROR_CODE;
          }
          return {
            data: null,
            error,
          };
        }
        return {
          data: data.data.reduce((mostRecent, file) => {
            if (!mostRecent) {
              return file;
            }
            if (new Date(file.fileDate) > new Date(mostRecent.fileDate)) {
              return file;
            }
            return mostRecent;
          }),
          error: null,
        };
      });
  }

  public getDependencyModIdsFromFile(file: Curseforge.File) {
    return file.dependencies
      .filter(d =>
        [
          FileRelationType.EmbeddedLibrary,
          FileRelationType.RequiredDependency,
          FileRelationType.Include,
        ].includes(d.relationType),
      )
      .map(d => d.modId);
  }

  public createModpackManifest({
    packSupportMeta,
    files,
    modLoaderVersion,
    version,
    author,
  }: ModpackExportParams & { files: Curseforge.File[] }): Curseforge.ModpackManifest {
    return {
      minecraft: {
        version: packSupportMeta.gameVersion,
        modLoaders: [
          {
            id: modLoaderVersion,
            primary: true,
          },
        ],
      },
      manifestType: "minecraftModpack",
      manifestVersion: 1,
      name: packSupportMeta.pack.name,
      version,
      author,
      files: files.map(file => ({
        projectId: file.modId,
        fileId: file.id,
        required: true,
      })),
      overrides: "overrides",
    };
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
