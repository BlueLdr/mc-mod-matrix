import { VersionSet } from "./version-set";
import { Platform } from "./types";

import type { Modrinth } from "@mcmm/modrinth";
import type {
  CurseforgeModMetadataRaw,
  GameVersion,
  Mod,
  ModLoader,
  Modpack,
  ModrinthModMetadataRaw,
  ModVersionData,
  PackSupportMeta,
  ModVersion,
} from "./types";
import type { Curseforge } from "@mcmm/curseforge";

//================================================

export const getCurseforgeModMetadata = (mod: Curseforge.Mod): CurseforgeModMetadataRaw => ({
  id: mod.id,
  slug: mod.slug,
  author: mod.authors?.[0],
  name: mod.name,
  summary: mod.summary,
  thumbnailUrl: mod.logo?.thumbnailUrl,
});

export const getCurseforgeModMetadataFromSearch = (
  mod: Curseforge.SearchResult,
): CurseforgeModMetadataRaw => ({
  id: mod.id,
  slug: mod.slug,
  author: mod.author,
  name: mod.name,
  summary: mod.summary,
  thumbnailUrl: mod.thumbnailUrl,
});

export const getModrinthModMetadata = (mod: Modrinth.SearchResult): ModrinthModMetadataRaw => ({
  project_id: mod.project_id,
  slug: mod.slug,
  author: mod.author,
  title: mod.title,
  description: mod.description,
  icon_url: mod.icon_url,
});

//================================================

export const getPackSupportForConfig = (
  pack: Modpack,
  gameVersion: GameVersion,
  loader: ModLoader,
): PackSupportMeta => {
  const supportedMods: Mod[] = [];
  const unsupportedMods: Mod[] = [];

  pack.mods.forEach(mod => {
    if (mod.versions.some(ver => ver.gameVersion === gameVersion && ver.loader === loader)) {
      supportedMods.push(mod);
    } else {
      unsupportedMods.push(mod);
    }
  });

  const percentage = supportedMods.length ? supportedMods.length / pack.mods.length : 0;

  console.log(`percentage: `, percentage);

  return {
    gameVersion,
    loader,
    pack,
    supportedMods,
    unsupportedMods,
    percentage,
  };
};

//================================================

export const parseModrinthVersionData = (pack: Modpack, data: Modrinth.Version[]) => {
  const versionData: Record<
    string,
    Record<GameVersion, Partial<Record<ModLoader, ModVersionData>>>
  > = {};
  data.forEach(projectVersion => {
    const mod = pack.mods.find(m => m.meta.modrinth?.project_id === projectVersion.project_id);
    if (!mod) {
      return;
    }
    const dataForProject = versionData[projectVersion.project_id] ?? {};
    projectVersion.game_versions.forEach(gameVersion => {
      const dataForGameVersion = dataForProject[gameVersion] ?? {};
      (projectVersion.loaders as ModLoader[]).forEach(loader => {
        if (dataForGameVersion[loader]) {
          return;
        }
        dataForGameVersion[loader] = {
          id: projectVersion.project_id,
          slug: mod.meta.slug,
          image: mod.meta.image,
          gameVersion,
          loader,
          platform: Platform.Modrinth,
        };
      });
    });
  });
  return versionData;
};

export const parseModrinthModVersionData = (
  meta: ModrinthModMetadataRaw,
  data: Modrinth.Version[],
): VersionSet<ModVersionData> => {
  const versionSet = new VersionSet<ModVersionData>();
  data.forEach(projectVersion => {
    projectVersion.game_versions.forEach(gameVersion => {
      (projectVersion.loaders as ModLoader[]).forEach(loader => {
        versionSet.push({
          gameVersion,
          loader,
          platform: Platform.Modrinth,
          id: meta.project_id,
          slug: meta.slug,
          image: meta.icon_url,
        });
      });
    });
  });
  return versionSet;
};

export const parseCurseforgeModFileData = (
  meta: CurseforgeModMetadataRaw,
  data: ModVersion[],
): VersionSet<ModVersionData> => {
  const versionSet = new VersionSet<ModVersionData>();
  data.forEach(modVersion => {
    versionSet.push({
      ...modVersion,
      id: meta.id,
      slug: meta.slug,
      image: meta.thumbnailUrl,
    });
  });
  return versionSet;
};
