import { DataRegistry } from "../../data";
import { importPlatformMods } from "./platformMods";

import type { PlatformModDbEntry } from "../../data";

//================================================

describe("importPlatformModMetadata", () => {
  let dataRegistry: DataRegistry;
  beforeEach(async () => {
    dataRegistry = new DataRegistry();
    await dataRegistry.db.platformMods.bulkAdd(initialData);
  }, 1000);

  afterEach(async () => {
    await dataRegistry.db.delete({ disableAutoOpen: true });
    dataRegistry.db.close();
    dataRegistry = undefined;
  });

  it("should ignore identical existing records", async () => {
    const result = await importPlatformMods([initialData[0]], dataRegistry);

    expect(Object.keys(result.idMapping).length).toEqual(0);
    expect(Object.keys(result.recordsToUpdate).length).toEqual(0);
    expect(result.recordsToAdd.length).toEqual(0);
  }, 1000);

  it("should ignore all identical existing records", async () => {
    const result = await importPlatformMods(initialData, dataRegistry);

    expect(Object.keys(result.idMapping).length).toEqual(0);
    expect(Object.keys(result.recordsToUpdate).length).toEqual(0);
    expect(result.recordsToAdd.length).toEqual(0);
  }, 1000);

  it("should add new records", async () => {
    const result = await importPlatformMods(newData, dataRegistry);

    expect(Object.keys(result.idMapping).length).toEqual(0);
    expect(Object.keys(result.recordsToUpdate).length).toEqual(0);
    expect(result.recordsToAdd).toEqual(newData);
  }, 1000);

  it("should update records with lower min fetched versions", async () => {
    const record = initialData[0];
    const newRecords = [{ ...record, meta: { ...record.meta, minGameVersionFetched: "1.8.1" } }];

    const result = await importPlatformMods(newRecords, dataRegistry);

    expect(Object.keys(result.idMapping).length).toEqual(0);
    expect(result.recordsToAdd.length).toEqual(0);

    expect(Object.keys(result.recordsToUpdate).length).toEqual(1);
    expect(result.recordsToUpdate[record.id]).toBeDefined();
    result.recordsToUpdate[record.id](record);
    expect(record).toEqual(newRecords[0]);
  }, 1000);
});

const initialData: PlatformModDbEntry[] = [
  {
    id: "Curseforge:1177338",
    meta: {
      platform: "Curseforge",
      id: 1177338,
      slug: "let-me-crawl",
      authorName: "Diesse",
      authorId: 111271268,
      modName: "Crawl",
      modDescription: "Movement adjustment allowing you to crawl.",
      thumbnailUrl:
        "https://media.forgecdn.net/avatars/thumbnails/1154/551/256/256/638722035376810232.png",
      lastUpdated: 1752605219074,
      minGameVersionFetched: "1.20.1",
    },
  },
  {
    id: "Curseforge:220318",
    meta: {
      platform: "Curseforge",
      id: 220318,
      slug: "biomes-o-plenty",
      authorName: "Forstride",
      authorId: 6883388,
      modName: "Biomes O' Plenty",
      modDescription:
        "Adds 50+ unique biomes to enhance your world, with new trees, flowers, and more!",
      thumbnailUrl:
        "https://media.forgecdn.net/avatars/thumbnails/477/194/256/256/637771671789296797.png",
      lastUpdated: 1752605156088,
      minGameVersionFetched: "1.20.1",
    },
  },
  {
    id: "Curseforge:227639",
    meta: {
      platform: "Curseforge",
      id: 227639,
      slug: "the-twilight-forest",
      authorName: "Benimatic",
      authorId: 7381421,
      modName: "The Twilight Forest",
      modDescription:
        "A realm basked in mystery and eerie twilight, you will overpower terrifying creatures and secure the adventure of a lifetime; in the Twilight Forest.",
      thumbnailUrl:
        "https://media.forgecdn.net/avatars/thumbnails/14/212/64/64/635589178760357568.png",
      lastUpdated: 1752605256265,
      minGameVersionFetched: "1.20.1",
    },
  },
  {
    id: "Curseforge:228970",
    meta: {
      platform: "Curseforge",
      id: 228970,
      slug: "world-handler-command-gui",
      authorName: "Exopandora",
      authorId: 7399377,
      modName: "World Handler - Command GUI",
      modDescription: "Minecraft ingame GUI for commands",
      thumbnailUrl:
        "https://media.forgecdn.net/avatars/thumbnails/274/916/256/256/637260214750955266.png",
      lastUpdated: 1752605197713,
      minGameVersionFetched: "1.20.1",
    },
  },
  {
    id: "Curseforge:238086",
    meta: {
      platform: "Curseforge",
      id: 238086,
      slug: "kubejs",
      authorName: "LatvianModder",
      authorId: 11776558,
      modName: "KubeJS",
      modDescription: "Edit recipes, add new custom items, script world events, all in JavaScript!",
      thumbnailUrl:
        "https://media.forgecdn.net/avatars/thumbnails/1053/159/256/256/638583716122159056.png",
      lastUpdated: 1752605234959,
      minGameVersionFetched: "1.20.1",
    },
  },
  {
    id: "Curseforge:238222",
    meta: {
      platform: "Curseforge",
      id: 238222,
      slug: "jei",
      authorName: "mezz",
      authorId: 17072262,
      modName: "Just Enough Items (JEI)",
      modDescription: "View Items and Recipes",
      thumbnailUrl:
        "https://media.forgecdn.net/avatars/thumbnails/29/69/64/64/635838945588716414.jpeg",
      lastUpdated: 1752605213151,
      minGameVersionFetched: "1.19.1",
    },
  },
];

const newData: PlatformModDbEntry[] = [
  {
    id: "Curseforge:239197",
    meta: {
      platform: "Curseforge",
      id: 239197,
      slug: "crafttweaker",
      authorName: "Jaredlll08",
      authorId: 10618648,
      modName: "CraftTweaker",
      modDescription:
        "CraftTweaker allows modpacks and servers to customize the game. With CraftTweaker you can change recipes, script events, add new commands and even change item properties!",
      thumbnailUrl:
        "https://media.forgecdn.net/avatars/thumbnails/142/108/256/256/636546700830987709.png",
      lastUpdated: 1752605160414,
      minGameVersionFetched: "1.20.1",
    },
  },
  {
    id: "Curseforge:241895",
    meta: {
      platform: "Curseforge",
      id: 241895,
      slug: "kleeslabs",
      authorName: "BlayTheNinth",
      authorId: 12099681,
      modName: "KleeSlabs",
      modDescription: "Break only the half of a double slab that you're looking at.",
      thumbnailUrl:
        "https://media.forgecdn.net/avatars/thumbnails/203/889/256/256/636935511172009471.png",
      lastUpdated: 1752605182553,
      minGameVersionFetched: "1.20.1",
    },
  },
  {
    id: "Curseforge:243121",
    meta: {
      platform: "Curseforge",
      id: 243121,
      slug: "quark",
      authorName: "Vazkii",
      authorId: 3852549,
      modName: "Quark",
      modDescription:
        "A Quark is a very small thing. This mod is a collection of small things that improve the vanilla minecraft experience.",
      thumbnailUrl:
        "https://media.forgecdn.net/avatars/thumbnails/588/295/256/256/637958240318838626.png",
      lastUpdated: 1752605261706,
      minGameVersionFetched: "1.20.1",
    },
  },
];
