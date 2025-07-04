"use client";

import { styled } from "@mui/material/styles";

import Box from "@mui/material/Box";

//================================================

export const SkeletonFade = styled(Box)({
  maxHeight: "calc(100vh - 9rem)",
  minHeight: "33vh",
  overflowX: "visible",
  overflowY: "clip",
  maskImage: "linear-gradient(to top, transparent 0%, black min(33vh, 15rem))",
  paddingInline: "1rem",
  marginInline: "-1rem",
});
