"use client";

import { useEffect } from "react";

import Card from "@mui/material/Card";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import ErrorOutline from "@mui/icons-material/ErrorOutline";

import type { CardProps } from "@mui/material/Card";
import type { GridProps } from "@mui/material/Grid";

//================================================

export type ErrorViewProps = {
  error: Partial<Error>;
} & (({ card: true } & CardProps) | ({ card?: false } & GridProps));

export function ErrorView({ error, card, ...props }: ErrorViewProps) {
  useEffect(() => {
    console.error(error);
  }, [error]);
  const content = (
    <Grid
      container
      direction="column"
      alignItems="center"
      justifyContent="center"
      key="content"
      {...(!card ? props : {})}
      className={`mcmm-EmptyView mcmm-ErrorView ${!card ? props.className : ""}`}
      px={14}
      pt={6}
      pb={10}
    >
      <ErrorOutline sx={{ fontSize: "9rem" }} />
      <Typography variant="subtitle2" mt={6}>
        {error.name ?? "Something went wrong"}
      </Typography>
      <Typography variant="body2" mt={3}>
        {error.message}
      </Typography>
    </Grid>
  );
  return !card ? content : <Card {...(props as CardProps)}>{content}</Card>;
}
