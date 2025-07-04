import { comparator } from "@mcmm/utils";

import type {
  GameVersion,
  Mod,
  ModLoader,
  ModMetadata,
  Modpack,
  PackSupportMeta,
  PlatformModMetadata,
} from "./types";

//================================================

export const getPackSupportForConfig = (
  pack: Modpack,
  gameVersion: GameVersion,
  loader: ModLoader,
  getMod: (modId: string) => Mod | undefined,
): PackSupportMeta => {
  const supportedMods: Mod[] = [];
  const unsupportedMods: Mod[] = [];
  const supportedAlternativeMods: Mod[] = [];

  for (const mod of pack.mods) {
    if (mod.versions.has({ gameVersion, loader })) {
      supportedMods.push(mod);
    } else {
      unsupportedMods.push(mod);
      if (mod.alternatives?.length) {
        const altModMeta = mod.alternatives.reduce<Mod | undefined>((match, alt) => {
          const altMod = getMod(alt);
          return match || altMod?.versions?.has({ gameVersion, loader }) ? altMod : match;
        }, undefined);
        if (altModMeta) {
          supportedAlternativeMods.push(altModMeta);
        }
      }
    }
  }

  const percentage = supportedMods.length ? supportedMods.length / pack.mods.length : 0;
  const percentageWithAlternatives =
    supportedMods.length || supportedAlternativeMods.length
      ? (supportedMods.length + supportedAlternativeMods.length) / pack.mods.length
      : 0;

  return {
    gameVersion,
    loader,
    pack,
    supportedMods,
    unsupportedMods,
    supportedAlternativeMods,
    percentage,
    percentageWithAlternatives,
  };
};

//================================================

export const getUniqueIdForPlatformModMeta = (meta: PlatformModMetadata) =>
  `${meta.platform}:${meta.id}`;

export const getUniqueIdForModMetadata = (meta: ModMetadata) =>
  meta.platforms
    .slice()
    .sort(comparator("asc", "platform"))
    .map(getUniqueIdForPlatformModMeta)
    .join("_");
