"use client";

import { capitalize } from "lodash";
import { useContext, useRef } from "react";

import { LoaderIcon, ModpackDetailPageContext, ScrollNavContext } from "~/components";
import { DataContext } from "~/context";
import { useStackedStickyElement } from "~/utils";

import Box from "@mui/material/Box";
import Divider from "@mui/material/Divider";
import Tabs from "@mui/material/Tabs";
import Chip from "@mui/material/Chip";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import Tab from "@mui/material/Tab";

//================================================

export function ModpackDetailPageHeader() {
  const { currentPack: pack } = useContext(DataContext);
  const { currentAnchor } = useContext(ScrollNavContext);
  const { isSingleColumn } = useContext(ModpackDetailPageContext);

  const ref = useRef<HTMLDivElement>(null);
  const rootStyle = useStackedStickyElement(ref.current);

  if (!pack) {
    return null;
  }

  return (
    <Box
      ref={ref}
      style={rootStyle}
      sx={{
        backgroundColor: theme => theme.palette.background.default,
        zIndex: 100,
        padding: theme => theme.spacing(4),
        paddingBottom: 0,
        margin: theme => theme.spacing(-4),
        marginBottom: 0,
      }}
    >
      <Grid
        container
        display="grid"
        mb={6}
        spacing={1}
        gridTemplateColumns="1fr auto"
        gridTemplateRows="repeat(auto-fill, auto)"
      >
        <Grid container alignItems="center" flexWrap="wrap">
          <Grid container alignItems="center" spacing={2}>
            <Typography variant="h4" fontWeight={600} pr={2}>
              {pack.name}
            </Typography>
            <Grid container spacing={2}>
              {pack.loaders.map(loader => (
                <Chip
                  key={loader}
                  icon={<LoaderIcon loader={loader} size={20} />}
                  label={capitalize(loader)}
                />
              ))}
            </Grid>
          </Grid>
        </Grid>
        {isSingleColumn && (
          <Grid gridRow="span 2">
            <Tabs value={currentAnchor ?? "list"}>
              <Tab href="#list" value="list" label="Mods" />
              <Tab href="#matrix" value="matrix" label="Matrix" />
            </Tabs>
          </Grid>
        )}
        <Typography variant="body1">
          Minecraft{" "}
          <Typography component="span" fontWeight={600}>
            {pack.versions.min} - {pack.versions.max}
          </Typography>{" "}
        </Typography>
      </Grid>
      <Divider />
    </Box>
  );
}
