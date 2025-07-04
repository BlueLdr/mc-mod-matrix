import {
  ModpackDetailPageHeader,
  ModpackDetailPageProvider,
  ScrollNavProvider,
} from "~/components";

import Container from "@mui/material/Container";

import type { Metadata } from "next";
import type { WithChildren } from "@mcmm/types";

//================================================

export async function generateMetadata({
  params,
}: {
  params: Promise<{ name: string }>;
}): Promise<Metadata> {
  return {
    title: decodeURIComponent((await params).name),
  };
}

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
