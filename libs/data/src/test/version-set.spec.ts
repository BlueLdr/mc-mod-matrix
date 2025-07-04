import { values } from "lodash";

import { ModLoader, Platform } from "../lib/types";
import { VersionSet } from "../lib/version-set";

import type { GameVersion, ModVersion } from "../lib/types";

//================================================

const gameVersions: GameVersion[] = new Array(10)
  .fill(undefined)
  .reduce<
    string[]
  >((all, _, index) => [...all, ...new Array(10).fill(undefined).map((__, minor) => `1.${index + 11}.${minor}`)], [] as string[]);
const loaders = values(ModLoader);
const platforms = values(Platform);
const allItems = gameVersions.reduce(
  (all, gameVersion) => [
    ...all,
    ...loaders.reduce(
      (all2, loader) => [
        ...all2,
        ...platforms.map<ModVersion>(platform => ({ gameVersion, loader, platform })),
      ],
      [] as ModVersion[],
    ),
  ],
  [] as ModVersion[],
);

const firstHalf = allItems.slice(0, allItems.length / 2);
const secondHalf = allItems.slice(allItems.length / 2);
const singleItem1 = secondHalf.shift() as ModVersion;
const singleItem2 = secondHalf.pop() as ModVersion;

describe("VersionSet", () => {
  describe("constructor", () => {
    it("should work with no args", () => {
      expect(Array.from(new VersionSet())).toEqual([]);
    });
    it("should work with ...items", () => {
      expect(Array.from(new VersionSet(...firstHalf))).toEqual(firstHalf);
    });
  });

  describe("get", () => {
    const versionSet = new VersionSet(...firstHalf);
    it("should work with GameVersion", () => {
      expect(Array.from(versionSet.get(gameVersions[0]))).toEqual(
        firstHalf.filter(v => v.gameVersion === gameVersions[0]),
      );
      expect(Array.from(versionSet.get(secondHalf[0].gameVersion))).toEqual([]);
    });
    it("should work with ModLoader", () => {
      expect(Array.from(versionSet.get(loaders[0]))).toEqual(
        firstHalf.filter(v => v.loader === loaders[0]),
      );
    });
  });

  describe("gameVersions", () => {
    const versionSet = new VersionSet(...firstHalf);
    it("should return a list of game versions", () => {
      expect(versionSet.gameVersions).toEqual(gameVersions.slice(0, gameVersions.length / 2));
    });
  });
  describe("modLoaders", () => {
    const versionSet = new VersionSet(...firstHalf);
    it("should return a list of mod loaders", () => {
      expect(versionSet.modLoaders).toEqual(loaders);
      expect(new VersionSet(firstHalf[0], singleItem1).modLoaders).toEqual([loaders[0]]);
      expect(new VersionSet(firstHalf[0], singleItem2).modLoaders).toEqual([
        loaders[0],
        loaders[loaders.length - 1],
      ]);
    });
  });

  describe("push", () => {
    const versionSet = new VersionSet(...firstHalf);
    it("should add an item to the set", () => {
      let length = versionSet.length;
      expect(versionSet.push(singleItem1)).toBe(length + 1);
      expect(versionSet.includes(singleItem1)).toBe(true);
      length = versionSet.length;
      expect(versionSet.push(singleItem1)).toBe(length);
      expect(versionSet.includes(singleItem1)).toBe(true);
    });
  });

  describe("concat", () => {
    const versionSet = new VersionSet(...firstHalf);
    it("should concat two sets", () => {
      const length = versionSet.length;
      const result = versionSet.concat(secondHalf);
      expect(Array.from(result)).toEqual(firstHalf.concat(secondHalf));
      expect(versionSet.length).toBe(length);
    });
    it("should concat overlapping sets without duplicates", () => {
      const length = versionSet.length;
      const result = versionSet.concat(
        allItems.slice(allItems.length / 4, (allItems.length * 3) / 4),
      );
      expect(Array.from(result)).toEqual(allItems.slice(0, (allItems.length * 3) / 4));
      expect(versionSet.length).toBe(length);
    });
  });
});
