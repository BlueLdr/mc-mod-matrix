"use client";

import { useEffect, useState } from "react";

import { PlatformIcon } from "~/components";

import { ModDetailPlatformEditor } from "./ModDetailPlatformEditor";
import { ModDetailPlatformItemContent } from "./ModDetailPlatformItemContent";

import IconButton from "@mui/material/IconButton";
import CardContent from "@mui/material/CardContent";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import CardHeader from "@mui/material/CardHeader";
import EditOutlined from "@mui/icons-material/EditOutlined";

import type { Platform, PlatformModMetadata } from "@mcmm/data";

//================================================

export type ModDetailPlatformItemProps = {
  meta: PlatformModMetadata | undefined;
  platform: Platform;
  onSave?: (platform: Platform, newMeta: PlatformModMetadata | undefined) => Promise<unknown>;
  allowRemove?: boolean;
};

export function ModDetailPlatformItem({
  meta,
  platform,
  onSave,
  allowRemove,
}: ModDetailPlatformItemProps) {
  const [editMode, setEditMode] = useState(false);

  useEffect(() => {
    if (!meta) {
      setEditMode(false);
    }
  }, [meta]);

  return (
    <Card>
      <CardHeader
        action={
          onSave ? (
            <IconButton
              onClick={() => setEditMode(true)}
              sx={{
                "&:not(:hover)": {
                  color: theme => theme.palette.grey[400],
                },
              }}
            >
              <EditOutlined fontSize="small" />
            </IconButton>
          ) : undefined
        }
        sx={{
          alignItems: "center",
        }}
        slotProps={{
          title: {
            variant: "body1",
          },
          action: {
            sx: {
              alignSelf: "center",
              display: "flex",
              margin: 0,
              marginLeft: theme => theme.spacing(8),
            },
          },
        }}
        title={
          <Grid container alignItems="center" spacing={2}>
            <PlatformIcon size={20} platform={platform} />
            {platform}
          </Grid>
        }
      />
      <CardContent sx={{ paddingBlock: theme => theme.spacing(1) }}>
        {editMode && onSave ? (
          <ModDetailPlatformEditor
            platform={platform}
            value={meta}
            onChange={onSave}
            closeEditor={() => setEditMode(false)}
            allowRemove={allowRemove}
          />
        ) : (
          <ModDetailPlatformItemContent meta={meta} link />
        )}
      </CardContent>
    </Card>
  );
}
