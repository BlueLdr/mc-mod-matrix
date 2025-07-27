"use client";

import { useParams } from "next/navigation";

import CircularProgress from "@mui/material/CircularProgress";
import Container from "@mui/material/Container";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";

//================================================

export default function NotFoundPage() {
  const params = useParams<{ id: string }>();
  const packId = decodeURIComponent(params.id);
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
        {!!packId && !("window" in global) ? (
          <CircularProgress variant="indeterminate" />
        ) : (
          <>
            <Typography variant="h6">Pack not found</Typography>
            <Typography variant="body2">
              Could not find a pack with id &quot;{packId}&quot;
            </Typography>
          </>
        )}
      </Grid>
    </Container>
  );
}
