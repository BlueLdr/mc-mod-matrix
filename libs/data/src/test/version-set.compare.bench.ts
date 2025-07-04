import * as Benny from "benny";
import { values } from "lodash";

import { ModLoader, Platform } from "../lib/types";

import type { VersionSet } from "./version-set-old";
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

const config = Benny.configure({
  cases: {
    maxTime: 1,
  },
});

export const runCompareBenchmark = <A extends typeof VersionSet, B extends typeof VersionSet>(
  OldClass: A,
  NewClass: B,
) => {
  const makeComparisonSuite = (name: string, makeTest: (Class: A | B) => () => any) =>
    Benny.suite(
      name,
      config,
      Benny.add("Old", makeTest(OldClass)),
      Benny.add("New", makeTest(NewClass)),
      Benny.cycle(),
      Benny.complete(),
    );

  console.log(`Benchmarking VersionSet comparison...`);
  makeComparisonSuite("constructor(empty)", Class => () => new Class());
  makeComparisonSuite("constructor(...items)", Class => () => new Class(...allItems));
  makeComparisonSuite("constructor(VersionSet)", Class => () => {
    const set = new Class(...allItems);
    return () => new Class(set);
  });

  makeComparisonSuite("has(loader)", Class => () => {
    const readOnlySet = new Class(...firstHalf);
    return () => readOnlySet.has(loaders[loaders.length / 2]);
  });
  makeComparisonSuite("has(gameVersion)", Class => () => {
    const readOnlySet = new Class(...firstHalf);
    return () => readOnlySet.has(gameVersions[gameVersions.length / 4]);
  });
  makeComparisonSuite("has(item)", Class => () => {
    const readOnlySet = new Class(...firstHalf);
    return () => readOnlySet.has(firstHalf[firstHalf.length / 2]);
  });
  makeComparisonSuite("has(missing item)", Class => () => {
    const readOnlySet = new Class(...firstHalf);
    return () => readOnlySet.has(singleItem1);
  });

  makeComparisonSuite("gameVersions", Class => () => {
    const readOnlySet = new Class(...firstHalf);
    return () => readOnlySet.gameVersions;
  });

  makeComparisonSuite("modLoaders", Class => () => {
    const readOnlySet = new Class(...firstHalf);
    return () => readOnlySet.modLoaders;
  });

  makeComparisonSuite("push(new item)", Class => () => {
    const set = new Class(...firstHalf);
    return () => set.push(singleItem1);
  });
  makeComparisonSuite("push(existing item)", Class => () => {
    const set = new Class(...firstHalf, singleItem1, singleItem2);
    return () => set.push(singleItem1);
  });

  makeComparisonSuite("concat(all new)", Class => () => {
    const set = new Class(...firstHalf);
    return () => set.concat(secondHalf);
  });
  makeComparisonSuite("concat(some new)", Class => () => {
    const set = new Class(...firstHalf);
    return () => set.concat(allItems.slice(allItems.length / 4, (allItems.length * 3) / 4));
  });
  makeComparisonSuite("concat(no new)", Class => () => {
    const set = new Class(...firstHalf);
    return () => set.concat(firstHalf);
  });
};
