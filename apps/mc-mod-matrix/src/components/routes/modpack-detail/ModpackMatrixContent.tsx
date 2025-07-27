"use client";

import { capitalize } from "lodash";
import { useContext, useEffect, useMemo, useState } from "react";

import { comparator } from "@mcmm/utils";
import {
  EmptyViewCard,
  MatrixOverflowContainer,
  ModMatrix,
  ModMatrixItemModal,
  ModpackDetailPageContext,
  ModpackSupportIssuesList,
  Unpin,
} from "~/components";
import { StorageContext } from "~/context";
import { usePackSupportMetaList } from "~/data-utils";
import { MOD_DETAIL_MODAL_SEARCH_PARAM, useSearchParamSetter } from "~/utils";

import Tooltip from "@mui/material/Tooltip";
import IconButton from "@mui/material/IconButton";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardHeader from "@mui/material/CardHeader";
import Switch from "@mui/material/Switch";
import Typography from "@mui/material/Typography";
import Grid from "@mui/material/Grid";

import type { Modpack, PackSupportMeta } from "@mcmm/data";

//================================================

const filterTopPercentile = (data: PackSupportMeta[], percentile = 25): PackSupportMeta[] => {
  const endIndex = Math.round(data.length / (100 / percentile));
  const bestItems = data
    .slice()
    .sort(comparator("desc", item => Math.max(item.percentage, item.percentageWithAlternatives)))
    .filter((item, index) => item.percentage === 1 || index < endIndex);

  const bestLoaders = new Set(bestItems.map(item => item.loader));
  const bestVersions = new Set(bestItems.map(item => item.gameVersion));

  return data.filter(item => bestLoaders.has(item.loader) && bestVersions.has(item.gameVersion));
};

//================================================

export type ModpackMatrixContentProps = { pack: Modpack; refreshIndicator?: React.ReactNode };

export function ModpackMatrixContent({ pack, refreshIndicator }: ModpackMatrixContentProps) {
  const { updatePack } = useContext(StorageContext);
  const setModDetailTarget = useSearchParamSetter(MOD_DETAIL_MODAL_SEARCH_PARAM, true);
  const { isSingleColumn } = useContext(ModpackDetailPageContext);

  const [showAll, setShowAll] = useState(false);
  const [detailTarget, setDetailTarget] = useState<PackSupportMeta>();

  const packSupportMetaList = usePackSupportMetaList(pack);
  const filteredList = useMemo(
    () => (showAll ? packSupportMetaList : filterTopPercentile(packSupportMetaList)),
    [packSupportMetaList, showAll],
  );

  useEffect(() => {
    if (!pack.pinnedVersions && pack.mods.length > 1) {
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

  const unpinVersion = (item: PackSupportMeta) => {
    updatePack({
      ...pack,
      pinnedVersions: (pack.pinnedVersions ?? []).filter(
        v => v.gameVersion !== item.gameVersion || v.loader !== item.loader,
      ),
    });
  };

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

  const matrix = (
    <ModMatrix key="matrix" data={filteredList} onClickItem={item => setDetailTarget(item)} />
  );

  return (
    <Grid container direction="column" spacing={4}>
      <Grid
        container
        spacing={8}
        justifyContent="space-between"
        sx={{ height: theme => theme.spacing(9) }}
      >
        <Grid container alignItems="center" spacing={4}>
          <Typography variant="h6">Mod support matrix</Typography>
          {refreshIndicator}
          {/*<Typography variant="body2">Total mods: {pack.mods.length}</Typography>*/}
        </Grid>
        {/*<Grid>*/}
        {pack.mods.length > 1 ? (
          <Typography component="label" variant="caption">
            <Switch checked={showAll} onChange={(_, checked) => setShowAll(checked)} />
            Show all versions
          </Typography>
        ) : (
          <div />
        )}
        {/*</Grid>*/}
      </Grid>
      {pack.mods.length > 1 ? (
        <Grid
          container
          spacing={4}
          maxWidth="100%"
          sx={
            isSingleColumn
              ? {}
              : {
                  flexWrap: "wrap",
                  flexDirection: "column",
                }
          }
        >
          <Grid
            flex="1 0 0"
            maxWidth="100%"
            minWidth="100%"
            display="grid"
            gridTemplateColumns="minmax(0, 1fr)"
          >
            <MatrixOverflowContainer>{matrix}</MatrixOverflowContainer>
          </Grid>
          <Grid
            container
            display="grid"
            flex={isSingleColumn ? "1 0 max(50%, 400px)" : undefined}
            spacing={4}
            gridTemplateColumns="repeat(auto-fill, minmax(320px, 1fr))"
            gridAutoRows="minmax(0, min-content)"
            maxWidth="100%"
          >
            {pinnedItems?.length ? (
              pinnedItems?.map(item => (
                <Card
                  key={`${item.loader}${item.gameVersion}`}
                  sx={{
                    maxWidth: "100%",
                    "& .MuiPaper-root": {
                      backgroundColor: theme => theme.palette.background.layer,
                    },
                  }}
                >
                  <CardHeader
                    title={`${capitalize(item.loader)} ${item.gameVersion}`}
                    action={
                      <Tooltip title="Unpin this version">
                        <IconButton onClick={() => unpinVersion(item)}>
                          <Unpin
                            sx={{
                              "&:not(:hover):not(:active)": {
                                color: theme => theme.palette.action.disabled,
                              },
                            }}
                          />
                        </IconButton>
                      </Tooltip>
                    }
                  />
                  <CardContent>
                    <ModpackSupportIssuesList
                      packSupportMeta={item}
                      onClickItem={mod => setModDetailTarget(mod.id)}
                    />
                  </CardContent>
                </Card>
              ))
            ) : (
              <EmptyViewCard sx={{ height: theme => theme.spacing(50), gridColumn: "span 2" }}>
                Pin a version from the matrix to have it appear here.
              </EmptyViewCard>
            )}
          </Grid>
        </Grid>
      ) : pack.mods.length > 0 ? (
        <EmptyViewCard sx={{ height: theme => theme.spacing(80) }}>
          Add some more mods to view mod support data.
        </EmptyViewCard>
      ) : null}
      <ModMatrixItemModal
        packSupportMeta={detailTarget}
        closeModal={() => setDetailTarget(undefined)}
      />
    </Grid>
  );
}
