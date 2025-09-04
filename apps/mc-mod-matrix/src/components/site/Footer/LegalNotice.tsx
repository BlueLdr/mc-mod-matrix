"use client";

import { useState } from "react";

import { Modal } from "~/components";

import Box from "@mui/material/Box";
import Link from "@mui/material/Link";

//================================================

export function LegalNotice() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Link component="button" onClick={() => setOpen(true)}>
        Legal Notice
      </Link>
      <Modal
        id="legal-notice"
        open={open}
        onClose={() => setOpen(false)}
        titleText="Legal Notice"
        maxWidth="sm"
      >
        The purpose of this application is to provide an easier way to check mod compatibility while
        building a modpack. All laws and rules that apply to the mods and their respective licenses
        in the distribution platforms (Modrinth, Curseforge, etc.) apply the same way in this
        application. For example, if a mod requires permission from the author to include in a
        modpack, that rule still applies here.
        <Box component="br" mb={4} />
        In other words, treat this application the same way that you would treat a distribution
        platform (Modrinth, Curseforge, etc.) with regards to creating modpacks.
      </Modal>
    </>
  );
}
