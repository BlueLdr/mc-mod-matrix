import { cloneDeep, flatten } from "lodash";

// @ts-expect-error: works at runtime
import { ModLoader } from "@mcmm/data";

import { importPacks, VERSION_OVERLAP_THRESHOLD } from "./pack";

// @ts-expect-error: works at runtime
import type { StoredModpack } from "@mcmm/data";

//================================================

describe("importPacks", () => {
  let existingPacks: StoredModpack[] = [];
  beforeEach(() => {
    existingPacks = cloneDeep(packs);
  });
  afterEach(() => {
    existingPacks = [];
  });

  it("should ignore identical packs", () => {
    const result = importPacks(
      existingPacks.map(pack => ({ ...pack, id: `${pack.id}x` })),
      existingPacks,
      allGameVersions,
      commonMods,
    );
    expect(result.recordsToAdd.length).toBe(0);
    expect(result.mergeConflicts.length).toBe(0);
    expect(Object.keys(result.recordsToUpdate).length).toBe(0);
  });

  it("should add packs that have no potential matches", () => {
    const newPacks: StoredModpack[] = [
      {
        id: "pack-1",
        mods: [...otherMods6],
        name: "Incoming 1",
        loaders: loaders[1],
        versions: versions[1],
      },
      {
        id: "pack-2",
        mods: [...commonMods, ...otherMods7],
        name: "Incoming 2",
        loaders: loaders[2],
        versions: versions[2],
      },
      {
        id: "pack-3",
        mods: [...commonMods, ...otherMods1],
        name: "Incoming 3",
        loaders: [ModLoader.Forge],
        versions: versions[2],
      },
      {
        id: "pack-4",
        mods: [...commonMods, ...otherMods1],
        name: "Incoming 3",
        loaders: [ModLoader.Forge],
        versions: { min: versions[1].min, max: versions[2].max },
      },
      {
        ...existingPacks[0],
        id: "pack-1",
        loaders: [ModLoader.NeoForge, ModLoader.Forge, ModLoader.Quilt],
      },
      {
        ...existingPacks[0],
        id: "pack-2",
        versions: expandVersionRangePastThreshold(existingPacks[0].versions),
      },
    ];
    const result = importPacks(newPacks, existingPacks, allGameVersions, commonMods);

    expect(result.recordsToAdd).toEqual(newPacks);
    expect(result.mergeConflicts.length).toBe(0);
    expect(Object.keys(result.recordsToUpdate).length).toBe(0);
  });

  it("should mark potential matches as merge conflicts", () => {
    const existing: StoredModpack = {
      id: "pack-1",
      name: "Pack 1",
      mods: [...commonMods, ...otherMods1, ...otherMods2, ...otherMods3, ...otherMods4],
      loaders: loaders[0],
      versions: versions[0],
    };
    const commonPack: StoredModpack = {
      id: "common",
      name: "Common",
      mods: [...commonMods],
      loaders: loaders[0],
      versions: versions[0],
    };

    const match = {
      ...existing,
      id: "pack-2",
      name: "Pack 2",
      mods: [...existing.mods, ...otherMods5, ...otherMods6],
    };
    const noMatch = {
      ...existing,
      id: "pack-3",
      name: "Pack 3",
      mods: [...match.mods, otherMods7[0]],
    };
    const result = importPacks(
      [match, noMatch],
      [existing, commonPack],
      allGameVersions,
      commonMods,
    );

    expect(result.recordsToAdd).toEqual([noMatch]);
    expect(result.mergeConflicts).toEqual([{ incoming: match, existing: [existing] }]);
  });
});

//================================================

const loaders = [
  [ModLoader.Fabric, ModLoader.NeoForge],
  [ModLoader.Fabric, ModLoader.NeoForge, ModLoader.Forge],
  [ModLoader.Fabric, ModLoader.NeoForge, ModLoader.Quilt],
  [ModLoader.Fabric, ModLoader.Forge],
  [ModLoader.NeoForge, ModLoader.Forge],
];

const versions = [
  { min: "1.3.2", max: "1.6.7" },
  { min: "1.8.4", max: "1.11.2" },
  { min: "1.13.2", max: "1.16.2" },
  { min: "1.17.2", max: "1.20.4" },
  { min: "1.20.1", max: "1.21.7" },
];

const commonMods = [
  "0a05a062-9076-4a7c-a6bf-cf7e6969dab8",
  "2523d0c6-52c9-4e7d-9607-5b15d7984e45",
  "358d7399-cb00-4aac-a4be-dcbc4f1eaaf4",
  "46b762f8-65e3-48b1-8b33-7722ba5072b5",
  "69f547d2-7fc7-458a-89a5-b4764efe053f",
  "76baef2c-19eb-4e67-975d-c67e9b0a37c1",
  "9284e474-261f-422c-8679-d634f349efa2",
  "afa50a08-bc20-42ce-8060-fe39b6ce4c52",
  "d1db9375-8ba8-4f51-83ca-246ff5cc4c42",
  "fee19124-a7aa-41ed-a835-3188440a46d3",
];

const otherMods1 = [
  "2a6015e6-3af8-484f-8605-66af6f09f1c9",
  "4fb0dd5c-8a14-4e43-ac35-3d50b43640c4",
  "991c5c94-898b-4aa7-b664-a6ed6ae16335",
  "ecc8caa9-02ba-47e7-b4f8-a6ae037d9ece",
  "f7a63e9a-4a48-40e8-875f-81fd64298686",
];

const otherMods2 = [
  "2b1f8796-4f92-49ab-81e5-6e26a6f049c8",
  "5c002d5d-6fcc-4a2b-be09-196353d8d46f",
  "63df69da-43b6-4960-b565-f30cbcf9b665",
  "9a6d0995-2791-482a-82fb-46c36b84b3e1",
  "aa1ef715-d133-4c3d-8317-39349d1a4d56",
];

const otherMods3 = [
  "03653829-aa9b-432c-913c-a62f29185be5",
  "2dc8cb41-b5f3-4d29-9809-93d2202b269b",
  "6c2361d7-94b6-41e1-9aaf-e460c3c4a4a9",
  "ab1144aa-d8dc-4781-8cbe-7eeb89f611ba",
  "dc839172-2926-43eb-a0f3-fb95d9eade90",
];

const otherMods4 = [
  "0c76c604-3806-49e2-b9bf-2e7d7b75cb65",
  "2b543f42-cadc-48ea-a8b5-8e2cd7b588c5",
  "55198e23-fd99-453e-8b19-3c1ced6bd867",
  "6292a64d-8673-4cea-8a61-483316c4fad1",
  "76799d80-3806-45e8-8f75-99899b59dd24",
];

const otherMods5 = [
  "0cfb80fa-2f78-45f4-b66d-29943b2e5834",
  "2304cc61-612d-4943-ace3-c72ae8503117",
  "3800b53f-32b0-4716-b29f-b64c84383c0c",
  "5f14d58a-dc73-40c9-ac82-4a763cd32e52",
  "f0f1a9ed-557e-4e00-97c3-2d63ec634a72",
];

const otherMods6 = [
  "0f7ade0f-cb62-4e80-81ca-b7b98154bb15",
  "1e4bdb51-2dab-4f6d-85a7-b323bf0d55d2",
  "23d45cdc-238f-4e16-a843-70aded050c55",
  "3b544ec2-4673-44df-ba9e-38d816c1460f",
  "9d96a4bd-1753-457e-891e-787f442059d8",
];

const otherMods7 = [
  "177f1510-c547-4d98-9772-24296f747375",
  "34731a80-96a4-4332-918c-fe67c5f4e463",
  "72d6d450-94ad-4fa8-b702-73df681649c8",
  "a6cd0c32-980a-4b29-aeb9-63471d16bc8c",
  "d03d5565-3d03-4687-9277-f562fa2ccd08",
];

const otherMods8 = [
  "1de92756-85f4-4d6f-8e4a-4b9287865c83",
  "6e24004a-c61f-42b4-8146-75b2891b9448",
  "9de48085-ab2c-48d8-a006-7149f84a8359",
  "f3f18748-7bc4-447d-9716-6a8f0e058fb0",
];

const otherMods9 = [
  "23bdb491-d0ea-4f54-8ec1-438c174cac72",
  "c1db7fc9-b7eb-498e-818f-8d023ee1f02d",
  "f7510509-2a4f-434d-b6af-e6c8ed895b0f",
];

const packs = [
  {
    id: "4cdd4736-cef1-42ff-836b-639b3b2d01c0",
    name: "First Pack",
    mods: [...commonMods, ...otherMods9, ...otherMods1],
    versions: versions[0],
    loaders: loaders[0],
  },
  {
    id: "7dc87beb-e811-4a2b-80a4-d637952821e3",
    name: "Second Pack",
    mods: [...commonMods, ...otherMods9, ...otherMods2],
    versions: versions[1],
    loaders: loaders[1],
  },
  {
    id: "73b457d4-7de1-4452-bca5-b80c1cb202b8",
    name: "Third Pack",
    mods: [...commonMods, ...otherMods9, ...otherMods3],
    versions: versions[2],
    loaders: loaders[2],
  },
  {
    id: "00df8ac3-95bc-43dd-a7e2-e582e817c18e",
    name: "Fourth Pack",
    mods: [...commonMods, ...otherMods8, ...otherMods4],
    versions: versions[3],
    loaders: loaders[3],
  },
  {
    id: "abcdef12-dead-beef-89a5-b4764efe053f",
    name: "Fifth Pack",
    mods: [...commonMods, ...otherMods5],
    versions: versions[4],
    loaders: loaders[4],
  },
];

const allGameVersions = flatten(
  new Array(22).fill(undefined).map((_, i) => {
    const count = Math.round(3 * Math.sin(i / 2.8) + 4) + 1;
    return new Array(count).fill(undefined).map((__, j) => `1.${i}${j > 0 ? `.${j}` : ""}`);
  }),
);

const expandVersionRangePastThreshold = (range: StoredModpack["versions"]) => {
  const min = allGameVersions.indexOf(range.min);
  const max = allGameVersions.indexOf(range.max);
  const count = max - min + 1;
  const newCount = count * (Math.ceil(2 / VERSION_OVERLAP_THRESHOLD) - 1);

  const newMax = Math.min(min + newCount, allGameVersions.length - 1);
  const newMin = Math.max(0, newMax - newCount);
  return { min: allGameVersions[newMin], max: allGameVersions[newMax] };
};
