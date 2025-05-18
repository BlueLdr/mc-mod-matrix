"use client";

import { forwardRef } from "react";

import { CurseforgeIcon, Icon, ModrinthIcon } from "~/components";

import Close from "@mui/icons-material/Close";
import Grid from "@mui/material/Grid";
import IconButton from "@mui/material/IconButton";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import ListItemIcon from "@mui/material/ListItemIcon";

import type { TypographyVariant } from "@mui/material/styles";
import type { ListItemProps } from "@mui/material/ListItem";
import type MenuItem from "@mui/material/MenuItem";
import type { MenuItemProps } from "@mui/material/MenuItem";
import type { ModMetadata } from "~/data";

//================================================

const ICON_SIZE_MAP: Record<Required<ModListItemProps>["size"], number> = {
  xs: 16,
  sm: 24,
  md: 32,
  lg: 48,
  xl: 64,
};
const TEXT_SIZE_MAP: Record<Required<ModListItemProps>["size"], TypographyVariant> = {
  xs: "caption",
  sm: "caption",
  md: "body1",
  lg: "h6",
  xl: "h5",
};

export type ModListItemOwnProps = {
  mod: ModMetadata;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  showPlatforms?: boolean | "link";
};

export type ModListItemProps = ModListItemOwnProps &
  (
    | ({ component: typeof MenuItem; onRemove?: never } & MenuItemProps)
    | ({
        component?: never;
        onRemove?: (mod: ModMetadata) => void;
      } & ListItemProps)
  );

export const ModListItem = forwardRef<HTMLLIElement, ModListItemProps>(
  ({ mod, size = "md", showPlatforms, component: Component, onRemove, ...props }, ref) => {
    const iconSize = ICON_SIZE_MAP[size];
    const platformIconSize = (iconSize >= 32 ? 0.5 : 0.625) * ICON_SIZE_MAP[size];
    const content = (
      <>
        <ListItemIcon sx={{ marginRight: theme => theme.spacing(2) }}>
          <Icon size={iconSize} src={mod.image} />
        </ListItemIcon>
        <ListItemText
          slotProps={{
            primary: {
              component: "div",
              variant: TEXT_SIZE_MAP[size],
            },
          }}
        >
          <Grid
            container
            spacing={4}
            justifyContent="space-between"
            alignItems="center"
            marginRight={4}
          >
            {mod.name}
            {showPlatforms && (
              <Grid container spacing={4}>
                <CurseforgeIcon
                  modSlug={showPlatforms === "link" ? mod.curseforge?.slug : undefined}
                  disabled={!mod.curseforge}
                  size={platformIconSize}
                />
                <ModrinthIcon
                  modSlug={showPlatforms === "link" ? mod.modrinth?.slug : undefined}
                  disabled={!mod.modrinth}
                  size={platformIconSize}
                />
              </Grid>
            )}
          </Grid>
        </ListItemText>
      </>
    );

    if (Component) {
      return (
        <Component ref={ref} id={`${mod.slug}`} value={mod.slug} {...props}>
          {content}
        </Component>
      );
    }

    return (
      <ListItem
        ref={ref}
        secondaryAction={
          onRemove ? (
            <IconButton onClick={() => onRemove(mod)}>
              <Close />
            </IconButton>
          ) : undefined
        }
        {...props}
      >
        {content}
      </ListItem>
    );
  },
);
ModListItem.displayName = "ModListItem";
