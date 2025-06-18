"use client";

import { Icon } from "~/components";
import { platformManager } from "~/data";

import Grid from "@mui/material/Grid";
import Link from "@mui/material/Link";
import Typography from "@mui/material/Typography";
import QuestionMark from "@mui/icons-material/QuestionMark";

import type { PlatformModMetadata } from "@mcmm/data";

//================================================

export type ModDetailPlatformItemContentProps = {
  meta: PlatformModMetadata | undefined;
  link?: boolean;
};

export function ModDetailPlatformItemContent({
  meta,
  link: isLink,
}: ModDetailPlatformItemContentProps) {
  const link = isLink && meta ? platformManager.getModLink(meta) : undefined;

  return (
    <Grid
      {...(link
        ? {
            component: Link,
            href: link,
            target: "_blank",
          }
        : {})}
      container
      sx={{
        display: "grid",
        alignItems: "center",
        gridTemplateColumns: "auto 1fr",
        gridTemplateRows: "auto auto",
        columnGap: theme => theme.spacing(4),
        "& > :first-child": {
          gridRowStart: "span 2",
          gridColStart: 1,
        },
        ...(link
          ? {
              textDecoration: "none",
              cursor: "pointer",
              borderRadius: ".125px",
              "&:hover": {
                backgroundColor: theme => theme.palette.grey[900],
                boxShadow: theme => `0 0 0 ${theme.spacing(2)} ${theme.palette.grey[900]}`,
              },
            }
          : {}),
      }}
    >
      {meta ? (
        <Icon src={meta.thumbnailUrl} size={48} />
      ) : (
        <QuestionMark sx={{ fontSize: 48 }} color="disabled" />
      )}
      <Typography
        variant="subtitle1"
        fontWeight={meta ? 600 : undefined}
        color={meta ? "textPrimary" : "textDisabled"}
        gridColumn="2"
        gridRow={meta ? "1" : "span 2"}
      >
        {meta ? meta.modName : "No mod selected"}
      </Typography>
      {meta && (
        <Typography variant="caption" color="textPrimary" gridColumn="2" gridRow="2">
          {meta.authorName}
        </Typography>
      )}
    </Grid>
  );
}
