"use client";

import { styled } from "@mui/material/styles";
import { get } from "lodash";

import { iconBaseStyles } from "./styles";

import type { IconProps } from "./icon";

//================================================

export type SvgIconProps = IconProps & { color?: string };

export const SvgIcon = styled("i", {
  shouldForwardProp: propName => propName !== "color" && propName !== "src",
})<SvgIconProps>(({ color, src, disabled, size, theme }) => ({
  maskImage: `url("${src}")`,
  backgroundColor: color
    ? ((value => (typeof value === "string" ? value : undefined))(get(theme.palette, color)) ??
      color)
    : "currentColor",
  ...iconBaseStyles({ disabled, size }),
}));
