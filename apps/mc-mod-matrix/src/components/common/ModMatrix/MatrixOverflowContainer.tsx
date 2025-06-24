"use client";

import { styled } from "@mui/material/styles";
import { useCallback, useRef, useState } from "react";

import { useMounted, useResizeObserver } from "~/utils";

import type { ResizeObserverEntryCallback } from "~/utils";

//================================================

const Container = styled("div", { shouldForwardProp: prop => prop !== "hasOverflow" })<{
  hasOverflow: boolean;
}>(({ hasOverflow, theme }) => ({
  maxWidth: "100%",
  ...(hasOverflow
    ? {
        border: `1px solid ${theme.palette.divider}`,
        borderRadius: `${theme.shape.borderRadius}px`,
        overflow: "auto",
        paddingRight: theme.spacing(4),
        paddingBottom: theme.spacing(4),
        "& > .MuiPaper-root": {
          border: "none",
        },
        "& .mcmm-Matrix__header": {
          position: "sticky",
          backgroundColor: theme.palette.background.paper,
          "&--top": {
            top: 0,
            zIndex: 5,
          },
          "&--left": {
            left: 0,
            zIndex: 6,
            borderBottom: `1px solid ${theme.palette.background.paper}`,
            "&.mcmm-Matrix__header--bottom": {
              marginBottom: "-1px",
            },
          },
        },
      }
    : {
        overflow: "visible",
      }),
}));

//================================================

export type MatrixOverflowContainerProps = React.HTMLAttributes<HTMLDivElement>;

export function MatrixOverflowContainer(props: MatrixOverflowContainerProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [matrixHasOverflow, setMatrixHasOverflow] = useState(false);
  const onMatrixResize = useCallback<ResizeObserverEntryCallback>(entry => {
    if (
      (entry.target.classList.contains("mcmm-MatrixContainer") &&
        entry.target.firstElementChild &&
        entry.target.firstElementChild.scrollWidth > entry.target.clientWidth) ||
      (entry.target.parentElement &&
        entry.target.parentElement.classList.contains("mcmm-MatrixContainer") &&
        entry.target.parentElement.clientWidth < entry.target.scrollWidth)
    ) {
      setMatrixHasOverflow(true);
    } else {
      setMatrixHasOverflow(false);
    }
  }, []);

  useResizeObserver(ref.current, onMatrixResize);
  useResizeObserver(ref.current?.firstElementChild ?? null, onMatrixResize);
  useMounted();

  return (
    <Container
      hasOverflow={matrixHasOverflow}
      ref={ref}
      {...props}
      className={`${props.className ?? ""} mcmm-MatrixContainer`}
    />
  );
}
