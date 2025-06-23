"use client";

import { mergeDeep } from "immutable";
import { values } from "lodash";
import { forwardRef } from "react";

import { getUniqueIdForModMetadata, Platform } from "@mcmm/data";
import { Icon, PlatformIcon } from "~/components";

import CircularProgress from "@mui/material/CircularProgress";
import Close from "@mui/icons-material/Close";
import Grid from "@mui/material/Grid";
import IconButton from "@mui/material/IconButton";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import ListItemIcon from "@mui/material/ListItemIcon";

import type { GridProps } from "@mui/material/Grid";
import type { ModMetadata } from "@mcmm/data";
import type { TypographyVariant } from "@mui/material/styles";
import type { ListItemProps } from "@mui/material/ListItem";
import type MenuItem from "@mui/material/MenuItem";
import type { MenuItemProps } from "@mui/material/MenuItem";

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
  loading?: boolean;
  contentLeft?: React.ReactNode;
  contentRight?: React.ReactNode;
  slotProps?: {
    contentLeft?: GridProps;
    contentRight?: GridProps;
  };
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
  (
    {
      mod,
      size = "md",
      showPlatforms,
      component: Component,
      onRemove,
      loading,
      contentLeft,
      contentRight,
      slotProps,
      ...props
    }: ModListItemProps,
    ref,
  ) => {
    const uniqueId = getUniqueIdForModMetadata(mod);
    const iconSize = ICON_SIZE_MAP[size];
    const platformIconSize = (iconSize >= 32 ? 0.5 : 0.625) * ICON_SIZE_MAP[size];
    const {
      contentLeft: contentLeftSlotProps,
      contentRight: contentRightSlotProps,
      ...otherSlotProps
    } = slotProps ?? {};

    const sx: ModListItemProps["sx"] = theme =>
      mergeDeep(
        {
          ...(props.onClick
            ? {
                cursor: "pointer",
                "&:not(:hover) .mcmm-ModListItem__alternatives--empty": {
                  display: "none",
                },
                "&:hover": {
                  backgroundColor: theme.palette.action.hover,
                },
                "&:active": {
                  backgroundColor: theme.palette.grey[900],
                },
              }
            : {}),
        },
        typeof props.sx === "function" ? (props.sx(theme) ?? {}) : (props.sx ?? {}),
      );

    const description = mod.platforms.find(p => !!p.modDescription)?.modDescription;

    const content = [
      <ListItemIcon
        key="icon"
        sx={{
          minWidth: `${iconSize}px`,
          marginRight: theme => theme.spacing(4),
          filter: loading ? "grayscale(1)" : undefined,
        }}
      >
        <Icon size={iconSize} src={mod.image || undefined} />
      </ListItemIcon>,
      <ListItemText
        key="text"
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
          flexWrap="nowrap"
        >
          <Grid container spacing={2} alignItems="center" {...contentLeftSlotProps}>
            <Grid whiteSpace="nowrap" textOverflow="ellipsis" overflow="hidden" flex="1 1 auto">
              {mod.name}
            </Grid>
            {contentLeft}
            {loading ? <CircularProgress variant="indeterminate" size={24} /> : null}
          </Grid>
          {(contentRight || showPlatforms) && (
            <Grid
              container
              spacing={4}
              alignItems="center"
              flexWrap="nowrap"
              flex="0 0 auto"
              {...contentRightSlotProps}
            >
              {contentRight}
              {showPlatforms && (
                <Grid container spacing={4} alignItems="center" flexWrap="nowrap" flex="0 0 auto">
                  {values(Platform).map(platform => {
                    const meta = mod.platforms.get(platform);

                    return (
                      <PlatformIcon
                        key={platform}
                        {...(showPlatforms === "link" && meta ? { meta } : { platform })}
                        disabled={!meta}
                        size={platformIconSize}
                        onClick={showPlatforms === "link" ? e => e.stopPropagation() : undefined}
                      />
                    );
                  })}
                </Grid>
              )}
            </Grid>
          )}
        </Grid>
      </ListItemText>,
    ];

    if (Component) {
      return (
        <Component ref={ref} id={uniqueId} value={uniqueId} title={description} {...props} sx={sx}>
          {content}
        </Component>
      );
    }

    return (
      <ListItem
        ref={ref}
        secondaryAction={
          onRemove ? (
            <IconButton
              onClick={e => {
                e.stopPropagation();
                onRemove(mod);
              }}
            >
              <Close />
            </IconButton>
          ) : undefined
        }
        title={description}
        slotProps={otherSlotProps}
        {...props}
        sx={sx}
      >
        {content}
      </ListItem>
    );
  },
);
ModListItem.displayName = "ModListItem";
