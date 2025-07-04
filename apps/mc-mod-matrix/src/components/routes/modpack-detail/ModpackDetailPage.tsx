"use client";

import { styled } from "@mui/material/styles";
import { useContext } from "react";

import {
  EmptyViewCard,
  ModpackDetailPageContext,
  ScrollNavSection,
  useScrollNav,
} from "~/components";
import { useStoredPackWithData } from "~/data-utils";

import { ModpackDetailModList } from "./ModpackDetailModList";
import { ModpackMatrixContent } from "./ModpackMatrixContent";

import Grid from "@mui/material/Grid";

import type { StoredModpack } from "@mcmm/data";

//================================================

const ListContainer = styled("div")(({ theme }) => ({
  flexGrow: theme.sizes.modDetail.list.flexGrow,
  flexShrink: 1,
  flexBasis: `${theme.sizes.modDetail.list.flexBasis}px`,
  minWidth: `${theme.sizes.modDetail.list.minWidth}px`,
}));

const MatrixContainer = styled("div")(({ theme }) => ({
  flexGrow: theme.sizes.modDetail.matrix.flexGrow,
  flexShrink: 1,
  flexBasis: `${theme.sizes.modDetail.matrix.flexBasis}px`,
  minWidth: `${theme.sizes.modDetail.matrix.minWidth}px`,
}));

//================================================

export type ModpackDetailPageProps = {
  pack: StoredModpack;
};

export function ModpackDetailPage({ pack: storedPack }: ModpackDetailPageProps) {
  const { isSingleColumn } = useContext(ModpackDetailPageContext);
  const pack = useStoredPackWithData(storedPack);

  const scrollNavSectionProps = useScrollNav({ scrollOffset: -4, disabled: !isSingleColumn });

  if (!pack || !pack.mods) {
    return "Loading...";
  }

  return (
    <Grid container flexWrap="wrap" sx={theme => ({ gap: theme.sizes.modDetail.spacing })}>
      <ScrollNavSection id="list" {...scrollNavSectionProps} component={ListContainer}>
        <ModpackDetailModList pack={pack} />
      </ScrollNavSection>
      <ScrollNavSection id="matrix" {...scrollNavSectionProps} component={MatrixContainer}>
        <ModpackMatrixContent pack={pack} />
      </ScrollNavSection>
      {pack?.mods?.length === 0 && (
        <EmptyViewCard sx={{ height: theme => theme.spacing(100), flex: "1 1 100%" }}>
          Add some more mods to view mod support data.
        </EmptyViewCard>
      )}
    </Grid>
  );
}
