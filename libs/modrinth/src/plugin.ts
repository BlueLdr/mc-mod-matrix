import { pick, values } from "lodash";

import { createDisplayableError } from "@mcmm/types";
import { formatLoaderVersion, ModLoader, Platform, VersionSet } from "@mcmm/data";
import { PlatformPlugin } from "@mcmm/platform";

import { modrinthApi } from "./lib/api";
import { ModpackManifestLoader } from "./lib/types";

import type { ModpackExportParams, PlatformPluginTypes } from "@mcmm/platform";
import type { GameVersion, PlatformModMetadata } from "@mcmm/data";
import type { ApiResponse } from "@mcmm/api";
import type * as Modrinth from "./lib/types";

//================================================

export type ModrinthPlatformModMetadata = Pick<
  Modrinth.SearchResult,
  "project_id" | "slug" | "author" | "title" | "description" | "icon_url"
>;

export class ModrinthPlatformPlugin
  extends PlatformPlugin<Platform.Modrinth, PlatformPluginTypes>
  implements PlatformPlugin<Platform.Modrinth, PlatformPluginTypes>
{
  platformName = Platform.Modrinth as const;
  modUrlBase = "https://modrinth.com/mod/";
  idType = "string" as const;
  manifestFilename = "modrinth.index.json";

  toModMetadata = (
    record: ModrinthPlatformModMetadata,
  ): PlatformModMetadata<Platform.Modrinth, ModrinthPlatformModMetadata["project_id"]> => {
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
    meta: PlatformModMetadata<Platform.Modrinth, ModrinthPlatformModMetadata["project_id"]>,
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
    meta: PlatformModMetadata<Platform.Modrinth, ModrinthPlatformModMetadata["project_id"]>,
    minGameVersion: GameVersion,
  ): Promise<ApiResponse<{ versions: VersionSet }>> {
    let gameVersions: GameVersion[] | undefined = undefined;
    if (minGameVersion && PlatformPlugin.allGameVersions) {
      gameVersions = PlatformPlugin.getVersionRange({ min: minGameVersion });
    }
    return modrinthApi
      .getModVersions(meta.id, gameVersions, values(ModLoader))
      .then(({ data, error }) => {
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
        return { data: { versions: versionSet }, error: null };
      });
  }

  getDependencyModIdsFromFile(file: Modrinth.FileWithVersionInfo) {
    const projectDeps: string[] = [],
      fileDeps: string[] = [],
      versionDeps: string[] = [];
    file.meta.dependencies.forEach(dep => {
      if (!(["embedded", "required"] as Modrinth.DependencyType[]).includes(dep.dependency_type)) {
        return;
      }
      if ("project_id" in dep && dep.project_id) {
        projectDeps.push(dep.project_id);
      } else {
        if ("version_id" in dep && dep.version_id) {
          versionDeps.push(dep.version_id);
        } else if ("file_name" in dep && dep.file_name) {
          fileDeps.push(dep.file_name);
        }
      }
    });
    if (fileDeps.length) {
      console.log(`fileDeps for ${file.filename}: `, fileDeps);
    }
    if (versionDeps.length) {
      console.log(`versionDeps for ${file.filename}: `, versionDeps);
    }

    return projectDeps;
  }

  createModpackManifest({
    packSupportMeta,
    files,
    modLoaderVersion,
    version,
  }: ModpackExportParams & { files: Modrinth.FileWithVersionInfo[] }): Modrinth.ModpackManifest {
    return {
      name: packSupportMeta.pack.name,
      versionId: version,
      formatVersion: 1,
      game: "minecraft",
      dependencies: {
        minecraft: packSupportMeta.gameVersion,
        [ModpackManifestLoader[packSupportMeta.loader]]: formatLoaderVersion(modLoaderVersion)[1],
      },
      files: files.map(f => ({
        path: `mods/${f.filename}`,
        hashes: f.hashes[0],
        downloads: [f.url],
        fileSize: f.size,
      })),
    };
  }

  public getLatestFileForMod(
    modId: string,
    gameVersion: GameVersion,
    loader: ModLoader,
  ): Promise<ApiResponse<Modrinth.FileWithVersionInfo>> {
    return modrinthApi.getModVersions(modId, [gameVersion], [loader]).then(({ data, error }) => {
      if (error || !data?.length) {
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
      const version = data.reduce((mostRecent, file) => {
        if (!mostRecent) {
          return file;
        }
        if (
          file.files?.length &&
          new Date(file.date_published) > new Date(mostRecent.date_published)
        ) {
          return file;
        }
        return mostRecent;
      });

      if (!version) {
        return {
          data: null,
          error: createDisplayableError(
            new Error(`Couldn't find matching version for mod ${modId}`),
          ),
        };
      }

      const { files, ...meta } = version;
      const file = files.find(f => f.primary) ?? files[0];
      if (!file) {
        return {
          data: null,
          error: createDisplayableError(
            new Error(`Couldn't find any files for matching version for mod ${modId}`),
          ),
        };
      }

      return {
        data: {
          ...file,
          meta,
        },
        error: null,
      };
    });
  }

  //================================================

  private makeMetaFromSearchResult(data: Modrinth.SearchResult): ModrinthPlatformModMetadata {
    return pick(data, "project_id", "slug", "author", "title", "description", "icon_url");
  }
}
