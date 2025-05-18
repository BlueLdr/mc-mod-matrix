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
  ModMetadata,
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

//================================================

export const createMergedMetadata = (
  modrinthItem: Modrinth.SearchResult | undefined,
  curseforgeItem: Curseforge.SearchResult | undefined,
): ModMetadata | undefined => {
  if (!modrinthItem && !curseforgeItem) {
    return;
  }
  return {
    name: modrinthItem?.title ?? curseforgeItem!.name,
    slug: modrinthItem?.slug ?? curseforgeItem!.slug,
    image: modrinthItem?.icon_url ?? curseforgeItem!.thumbnailUrl,
    curseforge: curseforgeItem ? getCurseforgeModMetadataFromSearch(curseforgeItem) : undefined,
    modrinth: modrinthItem ? getModrinthModMetadata(modrinthItem) : undefined,
  };
};

export const mergeSearchResults = async (
  modrinth: Modrinth.SearchResult[],
  curseforge: Curseforge.SearchResult[],
  isSameMod: (
    modrinth: Modrinth.SearchResult,
    curseforge: Curseforge.SearchResult,
  ) => Promise<boolean>,
): Promise<ModMetadata[]> => {
  const modrinthCopy = modrinth.slice();
  const curseforgeCopy = curseforge.slice();

  const curseforgeIdsUsed = new Set<number>();
  const modrinthIdsUsed = new Set<string>();

  const findMatchingModrinthMod = async (mod: Curseforge.SearchResult | undefined) => {
    if (!mod) {
      return undefined;
    }
    for (const item of modrinthCopy) {
      if (!modrinthIdsUsed.has(item.project_id) && (await isSameMod(item, mod))) {
        return item;
      }
    }
    return undefined;
  };

  const findMatchingCurseforgeMod = async (mod: Modrinth.SearchResult | undefined) => {
    if (!mod) {
      return undefined;
    }
    for (const item of curseforgeCopy) {
      if (!curseforgeIdsUsed.has(item.id) && (await isSameMod(mod, item))) {
        return item;
      }
    }
    return undefined;
  };

  const unifiedResults: ModMetadata[] = [];
  const addResult = (
    modrinthItem: Modrinth.SearchResult | undefined,
    curseforgeItem: Curseforge.SearchResult | undefined,
  ) => {
    const metadata = createMergedMetadata(modrinthItem, curseforgeItem);
    if (metadata) {
      unifiedResults.push(metadata);
      if (metadata.modrinth) {
        modrinthIdsUsed.add(metadata.modrinth.project_id);
      }
      if (metadata.curseforge) {
        curseforgeIdsUsed.add(metadata.curseforge.id);
      }
    }
  };

  while (modrinthCopy.length > 0 || curseforgeCopy.length > 0) {
    let currentModrinthMod = modrinthCopy.shift();
    let currentCurseforgeMod = curseforgeCopy.shift();

    if (currentModrinthMod && modrinthIdsUsed.has(currentModrinthMod.id)) {
      currentModrinthMod = undefined;
    }
    if (currentCurseforgeMod && curseforgeIdsUsed.has(currentCurseforgeMod.id)) {
      currentCurseforgeMod = undefined;
    }

    if (!currentModrinthMod && !currentCurseforgeMod) {
      break;
    }

    const currentModsMatch =
      !!currentModrinthMod &&
      !!currentCurseforgeMod &&
      (await isSameMod(currentModrinthMod, currentCurseforgeMod));
    if (currentModsMatch) {
      addResult(currentModrinthMod, currentCurseforgeMod);
      continue;
    }

    const matchForCurrentModrinthMod = await findMatchingCurseforgeMod(currentModrinthMod);
    if (matchForCurrentModrinthMod) {
      addResult(currentModrinthMod, matchForCurrentModrinthMod);
    }
    const matchForCurrentCurseforgeMod = await findMatchingModrinthMod(currentCurseforgeMod);
    if (matchForCurrentCurseforgeMod) {
      addResult(matchForCurrentCurseforgeMod, currentCurseforgeMod);
    }

    if (!matchForCurrentModrinthMod) {
      addResult(currentModrinthMod, undefined);
    }
    if (!matchForCurrentCurseforgeMod) {
      addResult(undefined, currentCurseforgeMod);
    }
  }

  return unifiedResults;
};
