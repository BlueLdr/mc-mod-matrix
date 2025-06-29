"use client";

import { styled } from "@mui/material/styles";
import { useContext } from "react";

import { ModpackDetailPageContext, ScrollNavSection, useScrollNav } from "~/components";

import { ModpackDetailModList } from "./ModpackDetailModList";
import { ModpackMatrixContent } from "./ModpackMatrixContent";

import Grid from "@mui/material/Grid";

import type { Modpack } from "@mcmm/data";

//================================================

const ListContainer = styled("div")`
  flex: 2 1 500px;
  min-width: 400px;
`;
const MatrixContainer = styled("div")`
  flex: 3 1 440px;
  min-width: 440px;
`;

//================================================

export type ModpackDetailPageProps = {
  pack: Modpack;
};

export function ModpackDetailPage({ pack }: ModpackDetailPageProps) {
  const { isSingleColumn } = useContext(ModpackDetailPageContext);

  const scrollNavSectionProps = useScrollNav({ scrollOffset: -4, disabled: !isSingleColumn });

  return (
    <Grid container flexWrap="wrap" spacing={4}>
      <ScrollNavSection id="list" {...scrollNavSectionProps} component={ListContainer}>
        <ModpackDetailModList pack={pack} />
      </ScrollNavSection>
      <ScrollNavSection id="matrix" {...scrollNavSectionProps} component={MatrixContainer}>
        <ModpackMatrixContent pack={pack} />
      </ScrollNavSection>
    </Grid>
  );
}
