import { ModpackDetailPageHeader } from "~/components";

import Container from "@mui/material/Container";

import type { WithChildren } from "~/utils";

//================================================

export default function ModpackDetailPageLayout({ children }: WithChildren) {
  return (
    <Container maxWidth="lg" sx={{ paddingBlock: "3rem" }}>
      <ModpackDetailPageHeader />
      {children}
    </Container>
  );
}
