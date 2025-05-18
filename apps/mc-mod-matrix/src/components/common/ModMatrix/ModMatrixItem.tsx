"use client";

import { styled } from "@mui/material/styles";

import Box from "@mui/material/Box";

import type { PackSupportMeta } from "@mcmm/data";

//================================================

const Component = styled(Box, {
  shouldForwardProp: (propName: PropertyKey) => propName !== "interactive",
})<{ interactive?: boolean }>(({ theme, interactive }) => ({
  border: `1px solid ${theme.palette.grey.A700}`,
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  padding: theme.spacing(2),
  marginBottom: "-1px",
  marginRight: "-1px",
  ...(interactive
    ? {
        transitionDuration: "100ms",
        transitionTimingFunction: theme.transitions.easing.easeInOut,
        transitionProperty: "transform, box-shadow",
        cursor: "pointer",
        boxShadow: `0 0 0 0 rgba(0, 0, 0, 0), 0 0 0 0 rgba(0, 0, 0, 0), 0 0 0 0 rgba(0, 0, 0, 0)`,

        "&:hover": {
          transform: "scale(1.1)",
          boxShadow: theme.shadows[4],
        },

        "&:hover:active": {
          transform: "scale(1.05)",
          boxShadow: theme.shadows[2],
        },
      }
    : {}),
}));

const getColor = (percentage: number) => `hsl(${percentage * 120}, 60%, 30%)`;

export type ModMatrixItemProps = {
  data: PackSupportMeta;
} & React.HTMLAttributes<HTMLDivElement>;

export function ModMatrixItem({ data, ...props }: ModMatrixItemProps) {
  const { percentage, supportedMods } = data;

  return (
    <Component
      {...props}
      sx={{
        backgroundColor: getColor(percentage),
      }}
      interactive={!!props.onClick}
    >
      {supportedMods.length}
    </Component>
  );
}
