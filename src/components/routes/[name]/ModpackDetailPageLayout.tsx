import { Outlet } from "react-router-dom";

import { ModpackDetailPageHeader } from "./ModpackDetailPageHeader";

import Container from "@mui/material/Container";

//================================================

export function ModpackDetailPageLayout() {
  return (
    <Container maxWidth="lg" sx={{ paddingBlock: "3rem" }}>
      <ModpackDetailPageHeader />
      <Outlet />
    </Container>
  );
}
