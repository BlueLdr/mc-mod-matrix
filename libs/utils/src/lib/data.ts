import type { EntryOf, PropsOfType } from "@mcmm/types";

//================================================

/** Get key/value pairs of a Typescript enum the same way you would from a
 *  normal object with Object.entries */
export const enumEntries = <T>(obj: T): EntryOf<typeof obj>[] =>
  (Object.entries(obj as any) as EntryOf<typeof obj>[]).filter(
    ent =>
      // @ts-expect-error: for numbers, this is valid
      typeof obj[ent[1]] !== "number",
  );

/** Object.keys, but for Typescript enum */
export const enumKeys = <T>(obj: T): (keyof typeof obj)[] => enumEntries(obj).map(ent => ent[0]);

/** Object.values, but for Typescript enum */
export const enumValues = <T>(obj: T): (typeof obj)[keyof typeof obj][] =>
  enumEntries(obj).map(ent => ent[1]);

export const comparator =
  <T extends object>(
    direction: "asc" | "desc",
    extract: PropsOfType<T, string | number> | ((item: T) => number),
    fallback?: (a: T, b: T) => number,
  ) =>
  (a: T, b: T): number => {
    const v_a = typeof extract === "function" ? extract(a) : a[extract];
    const v_b = typeof extract === "function" ? extract(b) : b[extract];
    return (
      (direction === "asc" ? 1 : -1) *
      (v_a < v_b ? -1 : v_a > v_b ? 1 : fallback ? fallback(a, b) : 0)
    );
  };

export const gameVersionComparator = <T extends string>(a: T, b: T) => {
  const [, aMinor, aPatch = 0] = a.split(".");
  const [, bMinor, bPatch = 0] = b.split(".");

  const result = Number(aMinor) - Number(bMinor) || Number(aPatch) - Number(bPatch);
  return isNaN(result) ? 0 : result;
};

interface GetMinGameVersion {
  <T extends string>(a: T, b: T | undefined): T;

  <T extends string>(a: T | undefined, b: T): T;

  <T extends string>(a: T | undefined, b: T | undefined): T | undefined;
}

export const getMinGameVersion = ((a, b) => {
  if (a == null && b == null) {
    return undefined;
  }
  if (a == null) {
    return b;
  }
  if (b == null) {
    return a;
  }
  return gameVersionComparator(a, b) > 0 ? b : a;
}) as GetMinGameVersion;

export const validateGameVersionRange = (versions: { min: string; max: string }) => {
  if (gameVersionComparator(versions.min, versions.max) > 0) {
    const temp = versions.max;
    versions.max = versions.min;
    versions.min = temp;
  }
};

export const makeRecordFromEntries = <Key extends string | number, Value>(
  entries: [Key, Value][],
) => Object.fromEntries(entries) as Record<Key, Value>;

export const gameVersionRegex = /^1(\.\d{1,2}){1,2}$/i;
