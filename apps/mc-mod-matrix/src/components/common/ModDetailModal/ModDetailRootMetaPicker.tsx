"use client";

import { useContext, useState } from "react";

import { Icon, PlatformIcon } from "~/components";
import { DataRegistryContext } from "~/context";

import Badge from "@mui/material/Badge";
import Grid from "@mui/material/Grid";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import Typography from "@mui/material/Typography";

import type { Mod, ModMetadata, Platform, PlatformModMetadata } from "@mcmm/data";

//================================================

const PROPERTY_MAP = {
  name: "modName",
  image: "thumbnailUrl",
} satisfies Record<ModDetailRootMetaPickerProps["property"], keyof PlatformModMetadata>;

export type ModDetailRootMetaPickerProps = {
  mod: Mod | undefined;
  property: keyof Pick<ModMetadata, "name" | "image">;
  size?: number;
};

export function ModDetailRootMetaPicker({
  mod,
  property,
  size = 32,
}: ModDetailRootMetaPickerProps) {
  const { dataRegistry } = useContext(DataRegistryContext);
  const [open, setOpen] = useState(false);
  if (!mod) {
    return null;
  }
  if (property === "name" && mod.meta.platforms.every(meta => meta.modName === mod.name)) {
    return mod.name;
  }

  const value = mod.meta.platforms.find(p => p[PROPERTY_MAP[property]] === mod.meta[property]);
  const renderIcon = (value: string) => <Icon size={size} src={value} />;

  if (property === "image" && mod.meta.platforms.length === 1) {
    return renderIcon(mod.meta.image);
  }

  return (
    <Select<Platform | null>
      className={open ? "Mui-open" : undefined}
      size="small"
      variant="standard"
      open={open}
      onOpen={() => setOpen(true)}
      onClose={() => setOpen(false)}
      renderValue={() =>
        property === "image" ? (
          renderIcon(mod?.meta?.[property])
        ) : (
          <Typography variant="h6">{mod?.meta.name}</Typography>
        )
      }
      value={value?.platform ?? null}
      onChange={event => {
        if (!event.target.value) {
          return;
        }
        dataRegistry.updateModRootMeta(mod.id, property, event.target.value as Platform);
      }}
      MenuProps={{
        slotProps: {
          list: {
            sx: {
              display: "grid",
              gridTemplateColumns: "1fr 1fr 1fr",
              alignItems: "center",
              justifyContent: "center",
              gap: 1,
            },
          },
        },
      }}
      sx={{
        lineHeight: 1,
        "&::before, &::after": {
          display: "none",
        },
        border: "1px solid transparent",
        borderRadius: theme => `${theme.shape.borderRadius}px`,
        p: 1,
        m: -1,
        "& .MuiSelect-select": {
          minHeight: theme => theme.spacing(8),
          display: "flex",
        },
        "&:not(:hover):not(:focus):not(.Mui-open)": {
          "& .MuiSelect-select": {
            p: 0,
          },
          "& .MuiSelect-icon": { display: "none" },
        },
        "&:hover, &:focus, &.Mui-open": {
          "& .MuiSelect-select": {
            p: 0,
            pr: 6,
          },
        },
        "&:hover, &:focus": {
          borderColor: theme => theme.palette.divider,
        },
        "&.Mui-open": {
          borderColor: theme => theme.palette.action.focus,
        },
      }}
    >
      {mod.meta.platforms.map(meta =>
        property === "image" ? (
          <MenuItem key={meta.platform} value={meta.platform} sx={{ p: 2 }}>
            <Grid
              container
              alignItems="center"
              justifyContent={property === "image" ? "center" : undefined}
              width="100%"
            >
              <Badge
                badgeContent={<PlatformIcon platform={meta.platform} size={12} />}
                anchorOrigin={{ horizontal: "left", vertical: "top" }}
              >
                {renderIcon(meta.thumbnailUrl)}
              </Badge>
            </Grid>
          </MenuItem>
        ) : (
          <MenuItem
            key={meta.platform}
            value={meta.platform}
            sx={{ py: 2, justifyContent: "space-between" }}
          >
            <ListItemText>{meta.modName}</ListItemText>
            <ListItemIcon sx={{ justifyContent: "flex-end" }}>
              <PlatformIcon size={16} platform={meta.platform} />
            </ListItemIcon>
          </MenuItem>
        ),
      )}
    </Select>
  );
}
