"use client";

import { values, flatten } from "lodash";
import { useState } from "react";

import { comparator } from "@mcmm/utils";
import { ModMatrix, ModMatrixItemModal } from "~/components";
import { ModLoader } from "@mcmm/data";

import Switch from "@mui/material/Switch";
import Typography from "@mui/material/Typography";
import Grid from "@mui/material/Grid";

import type { GameVersion, Modpack, PackSupportMeta } from "@mcmm/data";

//================================================

const isArrayOfModLoaders = (arr: unknown[]): arr is ModLoader[] =>
  // @ts-expect-error: it's fine
  values(ModLoader).includes(arr[0]);

const filterTop25Percentile = <T extends ModLoader[] | GameVersion[]>(
  data: PackSupportMeta[][],
  cols: T,
): [PackSupportMeta[][], T] => {
  const sorted = flatten(data).sort(
    comparator("desc", item => Math.max(item.percentage, item.percentageWithAlternatives)),
  );
  const bestItems = sorted.slice(0, Math.round(sorted.length / 4));
  const bestLoaders = new Set(bestItems.map(item => item.loader));
  const bestVersions = new Set(bestItems.map(item => item.gameVersion));

  const colsAreLoaders = isArrayOfModLoaders(cols);

  const filteredData = data.reduce((all, row) => {
    const filteredRow = row.filter(
      item => bestLoaders.has(item.loader) && bestVersions.has(item.gameVersion),
    );
    if (filteredRow.length > 0) {
      all.push(filteredRow);
    }
    return all;
  }, [] as PackSupportMeta[][]);

  return [
    filteredData,
    cols.filter(col =>
      colsAreLoaders ? bestLoaders.has(col as ModLoader) : bestVersions.has(col),
    ) as T,
  ];
};

//================================================

export type ModpackMatrixPageContentProps = { pack: Modpack };

export function ModpackMatrixPageContent({ pack }: ModpackMatrixPageContentProps) {
  const [showAll, setShowAll] = useState(false);
  const [detailTarget, setDetailTarget] = useState<PackSupportMeta>();
  return (
    <Grid container direction="column" spacing={4} mt={6}>
      <Grid container spacing={8} justifyContent="space-between">
        <Grid>
          <Typography variant="h6">Mod support matrix</Typography>
          <Typography variant="body2">Total mods: {pack.mods.length}</Typography>
        </Grid>
        <Grid>
          <Typography component="label" variant="caption">
            <Switch checked={showAll} onChange={(_, checked) => setShowAll(checked)} />
            Show all versions
          </Typography>
        </Grid>
      </Grid>
      <ModMatrix
        pack={pack}
        filterItems={showAll ? undefined : filterTop25Percentile}
        onClickItem={item => setDetailTarget(item)}
      />
      <ModMatrixItemModal
        packSupportMeta={detailTarget}
        closeModal={() => setDetailTarget(undefined)}
      />
    </Grid>
  );
}
