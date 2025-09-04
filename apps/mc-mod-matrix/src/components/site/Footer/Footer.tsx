"use client";

import { LegalNotice } from "./LegalNotice";

import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";

//================================================

export function SiteFooter() {
  return (
    <Grid
      component={Typography}
      variant="body2"
      container
      justifyContent="center"
      alignItems="center"
      px={8}
      py={3}
      sx={{
        backgroundColor: theme => theme.palette.background.layer,
        borderTop: theme => `1px solid ${theme.palette.divider}`,
      }}
    >
      <LegalNotice />
    </Grid>
  );
}
