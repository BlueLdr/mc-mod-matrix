"use client";

import { use } from "react";

import CircularProgress from "@mui/material/CircularProgress";
import Container from "@mui/material/Container";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";

import type { PageProps } from "~/utils";

//================================================

export type NotFoundPageProps = PageProps<{
  name: string;
}>;

export default function NotFoundPage({ params }: NotFoundPageProps) {
  const packName = decodeURIComponent(use(params).name);
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
        {!!packName && !("window" in global) ? (
          <CircularProgress variant="indeterminate" />
        ) : (
          <>
            <Typography variant="h6">Pack not found</Typography>
            <Typography variant="body2">
              Could not find a pack with name &quot;{packName}&quot;
            </Typography>
          </>
        )}
      </Grid>
    </Container>
  );
}
