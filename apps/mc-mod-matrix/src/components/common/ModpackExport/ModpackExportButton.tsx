"use client";

import { useState } from "react";

import { ModpackExportModal } from "./ModpackExportModal";

import Tooltip from "@mui/material/Tooltip";
import IconButton from "@mui/material/IconButton";
import Download from "@mui/icons-material/Download";
import Button from "@mui/material/Button";

import type { PackSupportMeta } from "@mcmm/data";

//================================================

export type ModpackExportButtonProps = {
  packMeta: PackSupportMeta;
  icon?: boolean;
};

export function ModpackExportButton({ packMeta, icon }: ModpackExportButtonProps) {
  const [open, setOpen] = useState(false);
  return (
    <>
      {icon ? (
        <Tooltip title="Export to a file">
          <IconButton onClick={() => setOpen(true)}>
            <Download />
          </IconButton>
        </Tooltip>
      ) : (
        <Button variant="contained" onClick={() => setOpen(true)}>
          Export pack
        </Button>
      )}
      <ModpackExportModal closeModal={() => setOpen(false)} target={open ? packMeta : undefined} />
    </>
  );
}
