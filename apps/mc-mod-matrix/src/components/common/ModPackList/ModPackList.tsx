"use client";

import { styled } from "@mui/material/styles";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useContext } from "react";

import { PackActionsMenu } from "~/components";
import { StorageContext } from "~/context";

import { ModPackListLoading } from "./ModPackList.loading";

import ListItemButton from "@mui/material/ListItemButton";
import ListItem from "@mui/material/ListItem";
import List from "@mui/material/List";

//================================================

const StyledListItem = styled(ListItem)`
  & .MuiListItemSecondaryAction-root {
    opacity: 0;
    transition: ${({ theme }) => theme.transitions.create("opacity")};
    padding-right: ${({ theme }) => theme.spacing(2)};

    &:hover,
    &:focus,
    &:focus-visible,
    &:has(.MuiButtonBase-root.Mui-expanded) {
      opacity: 1;
    }
  }

  &:hover,
  &:focus,
  &:focus-visible,
  &:focus-within {
    & .MuiListItemSecondaryAction-root {
      opacity: 1;
    }
  }
`;

export function ModPackList() {
  const params = useParams<{ id: string }>();
  const { packs } = useContext(StorageContext);

  if (!packs) {
    return <ModPackListLoading />;
  }

  return (
    <List>
      {packs.map(pack => (
        <StyledListItem
          key={pack.id}
          disablePadding
          secondaryAction={<PackActionsMenu pack={pack} size="small" />}
        >
          <ListItemButton
            selected={pack.id === decodeURIComponent(params.id ?? "")}
            component={Link}
            href={`/${encodeURIComponent(pack.id)}`}
          >
            {pack.name}
          </ListItemButton>
        </StyledListItem>
      ))}
    </List>
  );
}
