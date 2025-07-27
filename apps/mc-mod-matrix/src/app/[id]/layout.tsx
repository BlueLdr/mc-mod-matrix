import {
  ModpackDetailPageHeader,
  ModpackDetailPageProvider,
  ScrollNavProvider,
} from "~/components";
import { PLACEHOLDER_TITLE_TEXT } from "~/utils";

import Container from "@mui/material/Container";

import type { Metadata } from "next";
import type { WithChildren } from "@mcmm/types";

//================================================

export const metadata: Metadata = {
  title: PLACEHOLDER_TITLE_TEXT,
};

export default function ModpackDetailPageLayout({ children }: WithChildren) {
  return (
    <ModpackDetailPageProvider>
      <ScrollNavProvider>
        <Container
          maxWidth="xl"
          sx={{
            py: 12,
            ["@media (min-width: 600px)"]: {
              px: 6,
            },
            ["@media (max-width: 599px)"]: {
              px: 4,
            },
          }}
        >
          <ModpackDetailPageHeader />
          {children}
        </Container>
      </ScrollNavProvider>
    </ModpackDetailPageProvider>
  );
}
