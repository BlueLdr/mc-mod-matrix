import * as Benny from "benny";
import { values } from "lodash";

import { ModLoader, Platform } from "../lib/types";
import { VersionSet } from "../lib/version-set";
// import { VersionSet as VersionSetOld } from "./version-set-old";
// import { runCompareBenchmark } from "./version-set.compare.bench";

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

const runBenchmark = () => {
  console.log(`Benchmarking VersionSet...`);
  Benny.suite(
    "constructor",
    config,
    Benny.add("empty", () => new VersionSet()),
    Benny.add("items (half)", () => new VersionSet(...firstHalf)),
    Benny.add("items (full)", () => new VersionSet(...firstHalf, ...secondHalf)),
    Benny.cycle(),
    Benny.complete(),
  );

  const readOnlySet = new VersionSet(...firstHalf);
  Benny.suite(
    "has",
    config,
    Benny.add("loader", () => readOnlySet.has(loaders[loaders.length / 2])),
    Benny.add("game version", () => readOnlySet.has(gameVersions[gameVersions.length / 2])),
    Benny.add("item", () => readOnlySet.has(firstHalf[firstHalf.length / 2])),
    Benny.add("item (missing)", () => readOnlySet.has(singleItem1)),
    Benny.cycle(),
    Benny.complete(),
  );

  Benny.suite(
    "gameVersions",
    config,
    Benny.add.only("get", () => readOnlySet.gameVersions),
    Benny.cycle(),
    Benny.complete(),
  );

  Benny.suite(
    "modLoaders",
    config,
    Benny.add.only("get", () => readOnlySet.modLoaders),
    Benny.cycle(),
    Benny.complete(),
  );

  Benny.suite(
    "push",
    config,
    Benny.add("new item", () => {
      const set = new VersionSet(...firstHalf);
      return () => set.push(singleItem1);
    }),
    Benny.add("existing item", () => {
      const set = new VersionSet(...firstHalf, singleItem1, singleItem2);
      return () => set.push(singleItem1);
    }),
    Benny.cycle(),
    Benny.complete(),
  );

  Benny.suite(
    "concat",
    config,
    Benny.add("all new", () => {
      const set = new VersionSet(...firstHalf);
      return () => set.concat(secondHalf);
    }),
    Benny.add("some new", () => {
      const set = new VersionSet(...firstHalf);
      return () => set.concat(allItems.slice(allItems.length / 4, (allItems.length * 3) / 4));
    }),
    Benny.add("no new", () => {
      const set = new VersionSet(...firstHalf);
      return () => set.concat(firstHalf);
    }),
    Benny.cycle(),
    Benny.complete(),
  );
};

runBenchmark();
// runCompareBenchmark(VersionSetOld, VersionSet);

/*
Benny.suite(
  'name',
  config,

  Benny.cycle(),
  Benny.complete(),
)
*/
