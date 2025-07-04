"use client";

import { styled } from "@mui/material/styles";

import { ModListLoading } from "~/components";

import { ModpackMatrixContentLoading } from "./ModpackMatrixContent.loading";

import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import Skeleton from "@mui/material/Skeleton";
import Typography from "@mui/material/Typography";

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

const breakpointWithNav = <T extends object>(styles: T) => ({
  ["@media (max-width: 1338px)"]: styles,
});
const breakpointWithoutNav = <T extends object>(styles: T) => ({
  ["@media (max-width: 1018px)"]: styles,
});

//================================================

export type ModpackDetailPageLoadingProps = { navOpen?: boolean };

export function ModpackDetailPageLoading({ navOpen }: ModpackDetailPageLoadingProps) {
  return (
    <Grid container flexWrap="wrap" spacing={4}>
      <ListContainer>
        <Box marginBlock={6}>
          <Grid container mb={4} justifyContent="space-between" alignItems="center">
            <Grid
              container
              alignItems="center"
              spacing={3}
              sx={{ height: theme => theme.spacing(9) }}
            >
              <Typography variant="h6">Mods</Typography>
              <Typography variant="overline">{<Skeleton width="2rem" />}</Typography>
            </Grid>
          </Grid>
          <ModListLoading showPlatforms sx={{ marginBlock: 4 }} />
        </Box>
      </ListContainer>
      <MatrixContainer
        sx={{
          ...(navOpen ? breakpointWithNav : breakpointWithoutNav)({
            display: "none",
          }),
        }}
      >
        <ModpackMatrixContentLoading />
      </MatrixContainer>
    </Grid>
  );
}
