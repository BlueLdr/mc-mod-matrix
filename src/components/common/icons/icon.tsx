"use client";

import { styled } from "@mui/material/styles";

import { iconBaseStyles } from "./styles";

// ================================================================

export type IconProps = React.ComponentPropsWithRef<"img"> & {
  size?: number;
  disabled?: boolean;
};

export const Icon = styled("img", {
  shouldForwardProp: prop => prop !== "size",
})<{ size?: number; disabled?: boolean }>(iconBaseStyles);
