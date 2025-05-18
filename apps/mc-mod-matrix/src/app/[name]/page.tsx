"use client";

import { use, useContext } from "react";
import { ModpackDetailModList } from "~/components";

import { DataContext } from "~/context";

import Container from "@mui/material/Container";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";

import type { PageProps } from "~/utils";

//================================================

export type ModpackDetailPageProps = PageProps<{
  name: string;
}>;

export default function ModpackDetailPage({ params }: ModpackDetailPageProps) {
  const packName = decodeURIComponent(use(params).name);
  const { currentPack } = useContext(DataContext);
  if (!currentPack) {
    return (
      <Container maxWidth="md">
        <Grid
          container
          alignItems="center"
          justifyContent="center"
          flexDirection="column"
          flexGrow={1}
          width="100%"
          height="100vh"
        >
          <Typography variant="h6">Pack not found</Typography>
          <Typography variant="body2">
            Could not find a pack with name &quot;{packName}&quot;
          </Typography>
        </Grid>
      </Container>
    );
  }

  return <ModpackDetailModList pack={currentPack} />;
}
