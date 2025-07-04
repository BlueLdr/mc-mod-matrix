"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useContext } from "react";

import { StorageContext } from "~/context";

import ListItemButton from "@mui/material/ListItemButton";
import ListItem from "@mui/material/ListItem";
import List from "@mui/material/List";

//================================================

export function ModPackList() {
  const params = useParams<{ name: string }>();
  const { packs } = useContext(StorageContext);

  return (
    <List>
      {packs.map(pack => (
        <ListItem key={pack.name} disablePadding>
          <ListItemButton
            selected={pack.name === decodeURIComponent(params.name ?? "")}
            component={Link}
            href={`/${encodeURIComponent(pack.name)}`}
          >
            {pack.name}
          </ListItemButton>
        </ListItem>
      ))}
    </List>
  );
}
