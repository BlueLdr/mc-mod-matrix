"use client";

import { capitalize } from "lodash";
import { useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";

import { comparator } from "@mcmm/utils";
import {
  ModMatrix,
  ModMatrixItemModal,
  ModpackDetailPageContext,
  ModpackSupportIssuesList,
} from "~/components";
import { DataContext } from "~/context";
import { usePackSupportMetaList } from "~/data-utils";
import { useMounted, useResizeObserver } from "~/utils";

import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardHeader from "@mui/material/CardHeader";
import Switch from "@mui/material/Switch";
import Typography from "@mui/material/Typography";
import Grid from "@mui/material/Grid";

import type { ResizeObserverEntryCallback } from "~/utils";
import type { Modpack, PackSupportMeta } from "@mcmm/data";

//================================================

const filterTopPercentile = (data: PackSupportMeta[], percentile = 25): PackSupportMeta[] => {
  const bestItems = data
    .slice()
    .sort(comparator("desc", item => Math.max(item.percentage, item.percentageWithAlternatives)))
    .slice(0, Math.round(data.length / (100 / percentile)));

  const bestLoaders = new Set(bestItems.map(item => item.loader));
  const bestVersions = new Set(bestItems.map(item => item.gameVersion));

  return data.filter(item => bestLoaders.has(item.loader) && bestVersions.has(item.gameVersion));
};

//================================================

export type ModpackMatrixContentProps = { pack: Modpack };

export function ModpackMatrixContent({ pack }: ModpackMatrixContentProps) {
  const { updatePack } = useContext(DataContext);
  const { setIsSingleColumn, isSingleColumn } = useContext(ModpackDetailPageContext);

  const ref = useRef<HTMLDivElement>(null);
  const onResize = useCallback<ResizeObserverEntryCallback>(
    entry => {
      if (
        entry.target.parentElement?.parentElement &&
        entry.contentRect.width >= entry.target.parentElement.parentElement.offsetWidth - 100
      ) {
        setIsSingleColumn(true);
      } else {
        setIsSingleColumn(false);
      }
    },
    [setIsSingleColumn],
  );
  useResizeObserver(ref.current, onResize);
  useMounted();

  const [showAll, setShowAll] = useState(false);
  const [detailTarget, setDetailTarget] = useState<PackSupportMeta>();

  const packSupportMetaList = usePackSupportMetaList(pack);
  const filteredList = useMemo(
    () => (showAll ? packSupportMetaList : filterTopPercentile(packSupportMetaList)),
    [packSupportMetaList, showAll],
  );

  useEffect(() => {
    if (!pack.pinnedVersions) {
      const bestItemsSorted = filteredList
        .slice()
        .sort(
          comparator("desc", item => Math.max(item.percentage, item.percentageWithAlternatives)),
        )
        .slice(0, 3);

      updatePack({
        ...pack,
        pinnedVersions: bestItemsSorted.map(item => ({
          loader: item.loader,
          gameVersion: item.gameVersion,
        })),
      });
    }
  }, [filteredList, pack, updatePack]);

  const pinnedItems = useMemo(
    () =>
      pack.pinnedVersions
        ?.map(item =>
          packSupportMetaList.find(
            meta => meta.gameVersion === item.gameVersion && meta.loader === item.loader,
          ),
        )
        ?.filter(item => !!item),
    [pack.pinnedVersions, packSupportMetaList],
  );

  return (
    <Grid container direction="column" spacing={4} mt={6} ref={ref}>
      <Grid container spacing={8} justifyContent="space-between">
        {/*<Grid>*/}
        <Typography variant="h6">Mod support matrix</Typography>
        {/*<Typography variant="body2">Total mods: {pack.mods.length}</Typography>*/}
        {/*</Grid>*/}
        {/*<Grid>*/}
        <Typography component="label" variant="caption">
          <Switch checked={showAll} onChange={(_, checked) => setShowAll(checked)} />
          Show all versions
        </Typography>
        {/*</Grid>*/}
      </Grid>
      <Grid container spacing={4} flexWrap="wrap" direction={isSingleColumn ? undefined : "column"}>
        <Grid flex="1 0 0" minWidth="min-content">
          <ModMatrix data={filteredList} onClickItem={item => setDetailTarget(item)} />
        </Grid>
        <Grid
          container
          display="grid"
          flex="1 0 max(50%, 400px)"
          spacing={4}
          gridTemplateColumns="repeat(auto-fill, minmax(320px, 1fr))"
        >
          {pinnedItems?.map(item => (
            <Card key={`${item.loader}${item.gameVersion}`}>
              <CardHeader title={`${capitalize(item.loader)} ${item.gameVersion}`} />
              <CardContent>
                <ModpackSupportIssuesList packSupportMeta={item} />
              </CardContent>
            </Card>
          ))}
        </Grid>
      </Grid>
      <ModMatrixItemModal
        packSupportMeta={detailTarget}
        closeModal={() => setDetailTarget(undefined)}
      />
    </Grid>
  );
}
