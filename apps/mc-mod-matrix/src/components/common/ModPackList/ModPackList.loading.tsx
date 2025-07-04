"use client";

import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import Skeleton from "@mui/material/Skeleton";

export type ModPackListLoadingProps = { count?: number };

export function ModPackListLoading({ count = 10 }: ModPackListLoadingProps) {
  const packs = new Array(count)
    .fill(undefined)
    .map((_, i) => Math.max(Math.min(9 + Math.ceil(Math.tan(i) * (i % 5)), 16), 5));

  return (
    <List>
      {packs.map((width, i) => (
        <ListItem key={i} disablePadding sx={{ padding: theme => theme.spacing(0.5, 4) }}>
          <Skeleton sx={{ width: `${width}rem`, fontSize: "1.5rem" }} />
        </ListItem>
      ))}
    </List>
  );
}
