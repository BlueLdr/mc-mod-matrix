"use client";

import { useRef } from "react";

import { makeCalcString, stripCalcString } from "@mcmm/utils";
import { getCurrentStickyOffset, useMounted } from "~/utils";

import Box from "@mui/material/Box";

import type { BoxProps } from "@mui/material/Box";
import type { DistributiveOmit } from "@mcmm/types";

//================================================

export type AnchorProps = DistributiveOmit<BoxProps, "id"> & {
  id: string;
  scrollOffset?: number;
};

export function Anchor({ id, scrollOffset = 0, ...props }: AnchorProps) {
  useMounted();
  const ref = useRef<HTMLElement>(null);

  let offset = `${-1 * scrollOffset}px`;
  if (ref.current) {
    const stickyOffset = stripCalcString(getCurrentStickyOffset(ref.current));
    offset = stickyOffset ? makeCalcString(`-1 * ${stickyOffset}`, offset) : offset;
  }

  return (
    <Box
      {...props}
      id={id}
      ref={ref}
      style={{
        position: "relative",
        top: `${offset}`,
        display: "block",
        visibility: "hidden",
        height: 0,
        width: 0,
        zIndex: -999999,
        pointerEvents: "none",
      }}
    />
  );
}
