import { DataRegistry } from "../../data";
import { importMods } from "./mod";

import type { ModDbEntry } from "../../data";

//================================================

describe("importMods", () => {
  let dataRegistry: DataRegistry;
  beforeEach(async () => {
    dataRegistry = new DataRegistry();
    await dataRegistry.db.mods.bulkAdd(initialData);
  }, 1000);

  afterEach(async () => {
    await dataRegistry.db.delete({ disableAutoOpen: true });
    dataRegistry.db.close();
    dataRegistry = undefined;
  });

  it("should ignore existing identical records", async () => {
    const result = await importMods([initialData[0]], dataRegistry);

    expect(Object.keys(result.idMapping).length).toEqual(0);
    expect(Object.keys(result.recordsToUpdate).length).toEqual(0);
    expect(result.recordsToAdd.length).toEqual(0);
    expect(result.mergeConflicts?.length).toEqual(0);
  });

  it("should ignore all identical existing records", async () => {
    const result = await importMods(initialData, dataRegistry);

    expect(Object.keys(result.idMapping).length).toEqual(0);
    expect(Object.keys(result.recordsToUpdate).length).toEqual(0);
    expect(result.recordsToAdd.length).toEqual(0);
    expect(result.mergeConflicts?.length).toEqual(0);
  }, 1000);

  it("should add new records", async () => {
    const result = await importMods(newData, dataRegistry);

    expect(Object.keys(result.idMapping).length).toEqual(0);
    expect(Object.keys(result.recordsToUpdate).length).toEqual(0);
    expect(result.recordsToAdd).toEqual(newData);
    expect(result.mergeConflicts?.length).toEqual(0);
  }, 1000);

  it("should reconcile conflicting ids from new records", async () => {
    const newRecord = { ...newData[0], id: initialData[0].id };
    const newRecord2 = { ...newData[1], alternatives: [newRecord.id] };
    const result = await importMods([newRecord, newRecord2], dataRegistry);

    expect(Object.keys(result.idMapping).length).toEqual(1);
    expect(Object.keys(result.recordsToUpdate).length).toEqual(0);
    expect(result.recordsToAdd.length).toEqual(2);
    expect(result.mergeConflicts?.length).toEqual(0);

    const newRecordWithNewId = result.recordsToAdd[0];
    const { id, ...newRecordData } = newRecordWithNewId;
    expect({ ...newRecordData, id: newRecord.id }).toEqual(newRecord);
    expect(result.idMapping[initialData[0].id]).toEqual(newRecordWithNewId.id);
    expect(result.recordsToAdd[1]).toEqual({
      ...newRecord2,
      alternatives: [newRecordWithNewId.id],
    });
  }, 1000);

  it("should only remap id if incoming platform set is a subset of existing", async () => {
    const existing = newData[0];
    const incoming = { ...newData[0], platforms: [newData[0].platforms[0]], id: newData[1].id };
    const incoming2 = { ...newData[2], alternatives: [newData[1].id] };
    await dataRegistry.db.mods.add(existing);
    const result = await importMods([incoming, incoming2], dataRegistry);

    expect(Object.keys(result.idMapping).length).toEqual(1);
    expect(Object.keys(result.recordsToUpdate).length).toEqual(0);
    expect(result.recordsToAdd.length).toEqual(1);
    expect(result.mergeConflicts?.length).toEqual(0);

    expect(result.idMapping[incoming.id]).toEqual(existing.id);
    expect(result.recordsToAdd[0]).toEqual({ ...incoming2, alternatives: [existing.id] });
  });

  it("should not remap id if incoming platform set is a subset of existing and id is identical", async () => {
    const existing = newData[0];
    const incoming = { ...newData[0], platforms: [newData[0].platforms[0]] };
    await dataRegistry.db.mods.add(existing);
    const result = await importMods([incoming], dataRegistry);

    expect(Object.keys(result.idMapping).length).toEqual(0);
    expect(Object.keys(result.recordsToUpdate).length).toEqual(0);
    expect(result.recordsToAdd.length).toEqual(0);
    expect(result.mergeConflicts?.length).toEqual(0);
  });

  it("should remap id and update if incoming platform set is a superset of existing", async () => {
    const existing = {
      ...newData[0],
      platforms: [newData[0].platforms[0]],
      id: newData[1].id,
      minGameVersionFetched: "1.6.1",
    };
    const incoming = newData[0];
    await dataRegistry.db.mods.add(existing);
    const result = await importMods([incoming], dataRegistry);

    expect(Object.keys(result.idMapping).length).toEqual(1);
    expect(Object.keys(result.recordsToUpdate).length).toEqual(1);
    expect(result.recordsToAdd.length).toEqual(0);
    expect(result.mergeConflicts?.length).toEqual(0);

    expect(result.idMapping[incoming.id]).toEqual(existing.id);
    expect(result.recordsToUpdate[existing.id]).toBeDefined();
    result.recordsToUpdate[existing.id](existing);
    expect(existing).toEqual({ ...incoming, id: existing.id });
  });

  it("should only update if incoming platform set is a superset of existing and id is identical", async () => {
    const existing: ModDbEntry = {
      ...newData[0],
      platforms: [newData[0].platforms[0]],
      minGameVersionFetched: "1.6.1",
    };
    const incoming = newData[0];
    await dataRegistry.db.mods.add(existing);
    const result = await importMods([incoming], dataRegistry);

    expect(Object.keys(result.idMapping).length).toEqual(0);
    expect(Object.keys(result.recordsToUpdate).length).toEqual(1);
    expect(result.recordsToAdd.length).toEqual(0);
    expect(result.mergeConflicts?.length).toEqual(0);

    expect(result.recordsToUpdate[existing.id]).toBeDefined();
    result.recordsToUpdate[existing.id](existing);
    expect(existing).toEqual(incoming);
  });

  it("should treat multiple possible matches as a merge conflict", async () => {
    await dataRegistry.db.mods.bulkAdd(mergeConflictData);
    const result = await importMods([newData[0]], dataRegistry);

    expect(Object.keys(result.idMapping).length).toEqual(0);
    expect(Object.keys(result.recordsToUpdate).length).toEqual(0);
    expect(result.recordsToAdd.length).toEqual(0);
    expect(result.mergeConflicts?.length).toEqual(1);
    expect(result.mergeConflicts[0]).toEqual({
      incoming: newData[0],
      existing: mergeConflictData,
    });
  });

  it("should treat intersecting platform sets as a merge conflict if one is not a subset of the other", async () => {
    const conflictItemA = {
      ...newData[0],
      platforms: [newData[0].platforms[0], newData[1].platforms[1]],
    };
    const conflictItemB = newData[1];
    await dataRegistry.db.mods.add(conflictItemA);
    const result = await importMods([conflictItemB], dataRegistry);

    expect(Object.keys(result.idMapping).length).toEqual(0);
    expect(Object.keys(result.recordsToUpdate).length).toEqual(0);
    expect(result.recordsToAdd.length).toEqual(0);
    expect(result.mergeConflicts?.length).toEqual(1);
    expect(result.mergeConflicts[0]).toEqual({
      incoming: conflictItemB,
      existing: conflictItemA,
    });
  });

  it("should reconcile conflicting ids from new records in merge conflicts", async () => {
    const newRecord2 = { ...newData[2] };
    const newRecord2Partial = {
      ...newRecord2,
      platforms: [newRecord2.platforms[0]],
      id: newData[3].id,
    };
    const newRecord: ModDbEntry = {
      ...newData[0],
      id: initialData[0].id,
      alternatives: [newRecord2.id],
    };
    await dataRegistry.db.mods.bulkAdd([...mergeConflictData, newRecord2Partial]);
    const result = await importMods([newRecord, newRecord2], dataRegistry);

    expect(Object.keys(result.idMapping).length).toEqual(2);
    expect(Object.keys(result.recordsToUpdate).length).toEqual(1);
    expect(result.recordsToAdd.length).toEqual(0);
    expect(result.mergeConflicts?.length).toEqual(1);

    const { incoming: newRecordWithNewId } = result.mergeConflicts[0];
    expect(result.idMapping[initialData[0].id]).toEqual(newRecordWithNewId.id);
    expect(result.idMapping[newRecord2.id]).toEqual(newRecord2Partial.id);

    const { id, ...newRecordData } = newRecordWithNewId;
    expect({ ...newRecordData, id: newRecord.id }).toEqual({
      ...newRecord,
      alternatives: [result.idMapping[newRecord2.id]],
    });
    expect(result.mergeConflicts[0].existing).toEqual(mergeConflictData);
  }, 1000);

  /*  it("should update existing records in merge conflicts", async () => {
      const newRecord2 = { ...newData[1] };
      const newRecord2Partial = {
        ...newRecord2,
        platforms: [newRecord2.platforms[0]],
        id: newData[3].id,
      };
      const newRecord: ModDbEntry = {
        ...newData[0],
        id: initialData[0].id,
        alternatives: [newRecord2.id],
      };
      await dataRegistry.db.mods.bulkAdd([...mergeConflictData, newRecord2Partial]);
      const result = await importMods([newRecord, newRecord2], dataRegistry);

      expect(Object.keys(result.idMapping).length).toEqual(1);
      expect(Object.keys(result.recordsToUpdate).length).toEqual(1);
      expect(result.recordsToAdd.length).toEqual(0);
      expect(result.mergeConflicts?.length).toEqual(1);

      const { incoming: newRecordWithNewId } = result.mergeConflicts[0];
      const { id, ...newRecordData } = newRecordWithNewId;
      expect({ ...newRecordData, id: newRecord.id }).toEqual({
        ...newRecord,
        alternatives: [result.idMapping[newRecord2.id]],
      });
      expect(result.mergeConflicts[0].existing).toEqual({
        ...newRecord2,
        id: newData[1].id,
      });
      expect(result.idMapping[initialData[0].id]).toEqual(newRecordWithNewId.id);
    }, 1000);*/
});

const initialData: ModDbEntry[] = [
  {
    id: "03653829-aa9b-432c-913c-a62f29185be5",
    name: "DungeonZ",
    image: "https://media.forgecdn.net/avatars/thumbnails/820/695/64/64/638202099239377018.png",
    alternatives: [],
    platforms: ["Curseforge:864150", "Modrinth:11jwniuC"],
    minGameVersionFetched: "1.20.1",
  },
  {
    id: "0a05a062-9076-4a7c-a6bf-cf7e6969dab8",
    name: "KleeSlabs",
    image:
      "https://cdn.modrinth.com/data/7uh75ruZ/9d54dccb63b8fcb7fa0782ba42bfa771a7778d1f_96.webp",
    alternatives: [],
    platforms: ["Curseforge:241895", "Modrinth:7uh75ruZ"],
    minGameVersionFetched: "1.20.1",
  },
  {
    id: "0c76c604-3806-49e2-b9bf-2e7d7b75cb65",
    name: "Personality",
    image:
      "https://cdn.modrinth.com/data/zrAMu1nt/b799288fd2184cdc58ae7c7cd5dc7c06dd416f89_96.webp",
    alternatives: ["a6cd0c32-980a-4b29-aeb9-63471d16bc8c", "177f1510-c547-4d98-9772-24296f747375"],
    platforms: ["Curseforge:415974", "Modrinth:zrAMu1nt"],
    minGameVersionFetched: "1.20.1",
  },
  {
    id: "0cfb80fa-2f78-45f4-b66d-29943b2e5834",
    name: "World Handler - Command GUI",
    image: "https://media.forgecdn.net/avatars/thumbnails/274/916/256/256/637260214750955266.png",
    alternatives: [],
    platforms: ["Curseforge:228970"],
    minGameVersionFetched: "1.20.1",
  },
  {
    id: "0f7ade0f-cb62-4e80-81ca-b7b98154bb15",
    name: "EntityJS",
    image:
      "https://cdn.modrinth.com/data/OvPZ16yX/6bb35b3e0e93dfe993a1767e6a17ae3bfe8e371f_96.webp",
    alternatives: [],
    platforms: ["Curseforge:967617", "Modrinth:OvPZ16yX"],
    minGameVersionFetched: "1.20.1",
  },
  {
    id: "177f1510-c547-4d98-9772-24296f747375",
    name: "Crawl",
    image:
      "https://cdn.modrinth.com/data/Y7WvlnCO/291565ad70353cefa8a0828a4b9898aa6d299e0a_96.webp",
    alternatives: [],
    platforms: ["Curseforge:1177338", "Modrinth:Y7WvlnCO"],
    minGameVersionFetched: "1.20.1",
  },
  {
    id: "1de92756-85f4-4d6f-8e4a-4b9287865c83",
    name: "Memory Settings[Neo/Forge/Fabric]",
    image: "https://media.forgecdn.net/avatars/thumbnails/532/81/64/64/637855187332254154.png",
    alternatives: [],
    platforms: ["Curseforge:526901"],
    minGameVersionFetched: "1.20.1",
  },
  {
    id: "1e4bdb51-2dab-4f6d-85a7-b323bf0d55d2",
    name: "Create: Copycats+",
    image:
      "https://cdn.modrinth.com/data/UT2M39wf/c08340f503f781f1a260c3dd813e83bbec5abb5e_96.webp",
    alternatives: ["ab1144aa-d8dc-4781-8cbe-7eeb89f611ba"],
    platforms: ["Curseforge:968398", "Modrinth:UT2M39wf"],
    minGameVersionFetched: "1.20.1",
  },
  {
    id: "2304cc61-612d-4943-ace3-c72ae8503117",
    name: "Every Compat (Wood Good)",
    image:
      "https://media.forgecdn.net/avatars/thumbnails/554/210/256/256/637896029495149356_animated.gif",
    alternatives: [],
    platforms: ["Curseforge:628539", "Modrinth:eiktJyw1"],
    minGameVersionFetched: "1.20.1",
  },
  {
    id: "23bdb491-d0ea-4f54-8ec1-438c174cac72",
    name: "Better Compatibility Checker",
    image: "https://cdn.modrinth.com/data/KJhXPbHQ/bac6efc73281fab7a07ddca978800a5e9172b529.png",
    alternatives: [],
    platforms: ["Curseforge:551894", "Modrinth:KJhXPbHQ"],
    minGameVersionFetched: "1.20.1",
  },
];

const newData: ModDbEntry[] = [
  {
    id: "23d45cdc-238f-4e16-a843-70aded050c55",
    name: "Accelerated Decay",
    image:
      "https://cdn.modrinth.com/data/laX5CckD/f067053f21f651979c1f678548e1383374330b13_96.webp",
    alternatives: [],
    platforms: ["Curseforge:699872", "Modrinth:laX5CckD"],
    minGameVersionFetched: "1.20.1",
  },
  {
    id: "2523d0c6-52c9-4e7d-9607-5b15d7984e45",
    name: "Jade 🔍",
    image:
      "https://cdn.modrinth.com/data/nvQzSEkH/b04217bc2b7dc524c4d12f81ff42cc1cefb9b0fc_96.webp",
    alternatives: [],
    platforms: ["Curseforge:324717", "Modrinth:nvQzSEkH"],
    minGameVersionFetched: "1.20.1",
  },
  {
    id: "2a6015e6-3af8-484f-8605-66af6f09f1c9",
    name: "ProbeJS",
    image:
      "https://cdn.modrinth.com/data/JJNYRb4B/fc2c1372d7582544fc5cc2ac25ea59fc81d7213f_96.webp",
    alternatives: [],
    platforms: ["Curseforge:585406", "Modrinth:JJNYRb4B"],
    minGameVersionFetched: "1.20.1",
  },
  {
    id: "2b1f8796-4f92-49ab-81e5-6e26a6f049c8",
    name: "Create",
    image:
      "https://cdn.modrinth.com/data/LNytGWDc/61d716699bcf1ec42ed4926a9e1c7311be6087e2_96.webp",
    alternatives: [],
    platforms: ["Curseforge:328085", "Modrinth:LNytGWDc"],
    minGameVersionFetched: "1.20.1",
  },
  {
    id: "2b543f42-cadc-48ea-a8b5-8e2cd7b588c5",
    name: "Naturalist",
    image: "https://media.forgecdn.net/avatars/thumbnails/1198/547/64/64/638774805203022090.png",
    alternatives: [],
    platforms: ["Curseforge:627986", "Modrinth:F8BQNPWX"],
    minGameVersionFetched: "1.20.1",
  },
];

const mergeConflictData: ModDbEntry[] = [
  {
    id: "2523d0c6-52c9-4e7d-9607-5b15d7984e45",
    name: "Accelerated Decay",
    image:
      "https://cdn.modrinth.com/data/laX5CckD/f067053f21f651979c1f678548e1383374330b13_96.webp",
    alternatives: [],
    platforms: ["Curseforge:699872"],
    minGameVersionFetched: "1.20.1",
  },
  {
    id: "2b543f42-cadc-48ea-a8b5-8e2cd7b588c5",
    name: "Accelerated Decay",
    image:
      "https://cdn.modrinth.com/data/laX5CckD/f067053f21f651979c1f678548e1383374330b13_96.webp",
    alternatives: [],
    platforms: ["Modrinth:laX5CckD"],
    minGameVersionFetched: "1.20.1",
  },
];
