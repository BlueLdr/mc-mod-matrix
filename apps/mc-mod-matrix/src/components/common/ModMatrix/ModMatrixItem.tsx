"use client";

import Box from "@mui/material/Box";

import type { PackSupportMeta } from "@mcmm/data";

//================================================

const getColor = (percentage: number) => `hsl(${percentage * 120}, 50%, 25%)`;

export type ModMatrixItemProps = {
  data: PackSupportMeta;
};

export function ModMatrixItem({ data }: ModMatrixItemProps) {
  const { percentage, supportedMods } = data;

  return (
    <Box
      textAlign="center"
      sx={{
        backgroundColor: getColor(percentage),
        borderLeft: theme => `1px solid ${theme.palette.grey.A700}`,
        borderTop: theme => `1px solid ${theme.palette.grey.A700}`,
      }}
      p={2}
    >
      {supportedMods.length}
    </Box>
  );
}
