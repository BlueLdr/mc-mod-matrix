"use client";

import { styled } from "@mui/material/styles";
import { useContext, useRef, useState } from "react";

import { PackActionsModalsContext } from "~/context";

import MenuList from "@mui/material/MenuList";
import MenuItem from "@mui/material/MenuItem";
import IconButton from "@mui/material/IconButton";
import MoreHoriz from "@mui/icons-material/MoreHoriz";
import Menu from "@mui/material/Menu";

import type { ButtonProps } from "@mui/material/Button";
import type { StoredModpack } from "@mcmm/data";

//================================================

const Button = styled(IconButton)`
  border-radius: ${({ theme }) => theme.shape.borderRadius}px;

  &:not(:hover):not(:active):not(:focus) {
    color: ${({ theme }) => theme.palette.action.disabled};
    background-color: rgba(0, 0, 0, 0);
    transition: ${({ theme }) => theme.transitions.create(["color", "background-color"])};
  }

  &:hover {
    background-color: ${({ theme }) => theme.palette.action.hover};
  }

  &:active {
    background-color: ${({ theme }) => theme.palette.background.layer};
  }
`;

export type PackActionsMenuProps = { pack: StoredModpack | undefined; size?: ButtonProps["size"] };

export function PackActionsMenu({ pack, size }: PackActionsMenuProps) {
  const { setEditTarget, setDeleteTarget, setDuplicateTarget } =
    useContext(PackActionsModalsContext);
  const [menuOpen, setMenuOpen] = useState(false);

  const buttonRef = useRef<HTMLButtonElement>(null);

  if (!pack) {
    return null;
  }

  return (
    <>
      <Button
        ref={buttonRef}
        onClick={() => setMenuOpen(true)}
        className={menuOpen ? "Mui-expanded" : undefined}
        size={size}
      >
        <MoreHoriz />
      </Button>
      <Menu open={menuOpen} onClose={() => setMenuOpen(false)} anchorEl={buttonRef.current}>
        <MenuList>
          <MenuItem
            onClick={() => {
              setEditTarget(pack);
              setMenuOpen(false);
            }}
          >
            Edit pack
          </MenuItem>
          <MenuItem
            onClick={() => {
              setDuplicateTarget(pack);
              setMenuOpen(false);
            }}
          >
            Duplicate pack
          </MenuItem>
          <MenuItem
            onClick={() => {
              setDeleteTarget(pack);
              setMenuOpen(false);
            }}
          >
            Delete pack
          </MenuItem>
        </MenuList>
      </Menu>
    </>
  );
}
