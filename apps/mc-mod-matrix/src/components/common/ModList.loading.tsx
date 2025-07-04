import { values } from "lodash";
import { Fragment } from "react";

import { Platform } from "@mcmm/data";

import Card from "@mui/material/Card";
import Divider from "@mui/material/Divider";
import Grid from "@mui/material/Grid";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Skeleton from "@mui/material/Skeleton";

import type { CardProps } from "@mui/material/Card";

//================================================

export type ModListLoadingProps = CardProps & {
  count?: number;
  scale?: number;
  showPlatforms?: boolean;
};

export function ModListLoading({
  count = 20,
  scale = 1,
  showPlatforms,
  ...props
}: ModListLoadingProps) {
  const mods = new Array(count)
    .fill(undefined)
    .map((_, i) => Math.max(Math.min(16 + Math.ceil(Math.tan(i) * (i % 7)), 24), 8));

  return (
    <Card {...props}>
      <List>
        {mods.map((width, index) => (
          <Fragment key={index}>
            {index > 0 && <Divider />}
            <ListItem sx={{ paddingInline: 4 }}>
              <ListItemIcon
                sx={{
                  minWidth: "2rem",
                  marginRight: theme => theme.spacing(4),
                }}
              >
                <Skeleton variant="rectangular" sx={{ width: "2rem", height: "2rem" }} />
              </ListItemIcon>
              <ListItemText slotProps={{ primary: { component: "div", variant: "body1" } }}>
                <Grid
                  container
                  spacing={4}
                  justifyContent="space-between"
                  alignItems="center"
                  flexWrap="nowrap"
                >
                  <Grid
                    whiteSpace="nowrap"
                    textOverflow="ellipsis"
                    overflow="hidden"
                    flex="1 1 auto"
                  >
                    <Skeleton
                      sx={{
                        width: `${width * scale}rem`,
                        maxWidth: `${(scale === 1 ? scale : scale + (1 - scale) / 2) * 90}%`,
                      }}
                    />
                  </Grid>
                  <Grid container spacing={4} alignItems="center" flexWrap="nowrap" flex="0 0 auto">
                    {showPlatforms && (
                      <Grid
                        container
                        spacing={4}
                        alignItems="center"
                        flexWrap="nowrap"
                        flex="0 0 auto"
                      >
                        {values(Platform).map(platform => (
                          <Skeleton
                            key={platform}
                            variant="circular"
                            sx={{ width: "1rem", height: "1rem" }}
                          />
                        ))}
                      </Grid>
                    )}
                  </Grid>
                </Grid>
              </ListItemText>
            </ListItem>
          </Fragment>
        ))}
      </List>
    </Card>
  );
}
