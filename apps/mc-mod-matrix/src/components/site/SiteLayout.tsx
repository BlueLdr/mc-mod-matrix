"use client";

import styled from "@emotion/styled";

import {
  CommonProvider,
  CreatePackModalProvider,
  DataRegistryProvider,
  StorageProvider,
} from "~/context";
import { ModDetailModal } from "~/components";

import { NavDrawer } from "./NavDrawer";

import Box from "@mui/material/Box";

import type { WithChildren } from "@mcmm/types";

//================================================

const SiteContainer = styled(Box)`
  display: flex;
  flex-direction: column;
  flex: 1 1 100%;
`;
SiteContainer.displayName = "styled(SiteContainer)";

const Body = styled.main`
  display: flex;
  flex-direction: column;
  flex: 1 1 100%;
  box-sizing: border-box;

  & > .pending-view,
  & > * > .pending-view {
    min-height: ${({ theme }) => theme.spacing(120)};
  }
`;
Body.displayName = "Body";

//================================================

export type SiteLayoutProps = WithChildren & {
  initialNavOpen?: boolean;
};

export function SiteLayout({ initialNavOpen, children }: SiteLayoutProps) {
  return (
    <CommonProvider>
      <StorageProvider>
        <DataRegistryProvider>
          <CreatePackModalProvider>
            <NavDrawer initialOpen={initialNavOpen} />
            <Box display="flex" flexDirection="column" minHeight="100vh">
              <SiteContainer flexGrow={1}>
                <Body>{children}</Body>
              </SiteContainer>
            </Box>
            <ModDetailModal />
          </CreatePackModalProvider>
        </DataRegistryProvider>
      </StorageProvider>
    </CommonProvider>
  );
}
