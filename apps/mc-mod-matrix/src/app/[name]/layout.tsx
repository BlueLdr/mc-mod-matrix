import { ModpackDetailPageHeader } from "~/components";

import Container from "@mui/material/Container";

import type { WithChildren } from "@mcmm/types";

//================================================

export default function ModpackDetailPageLayout({ children }: WithChildren) {
  return (
    <Container maxWidth="lg" sx={{ paddingBlock: "3rem" }}>
      <ModpackDetailPageHeader />
      {children}
    </Container>
  );
}
