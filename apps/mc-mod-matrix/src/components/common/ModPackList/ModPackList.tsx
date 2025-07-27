"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useContext } from "react";

import { StorageContext } from "~/context";

import { ModPackListLoading } from "./ModPackList.loading";

import ListItemButton from "@mui/material/ListItemButton";
import ListItem from "@mui/material/ListItem";
import List from "@mui/material/List";

//================================================

export function ModPackList() {
  const params = useParams<{ id: string }>();
  const { packs } = useContext(StorageContext);

  if (!packs) {
    return <ModPackListLoading />;
  }

  return (
    <List>
      {packs.map(pack => (
        <ListItem key={pack.id} disablePadding>
          <ListItemButton
            selected={pack.id === decodeURIComponent(params.id ?? "")}
            component={Link}
            href={`/${encodeURIComponent(pack.id)}`}
          >
            {pack.name}
          </ListItemButton>
        </ListItem>
      ))}
    </List>
  );
}
