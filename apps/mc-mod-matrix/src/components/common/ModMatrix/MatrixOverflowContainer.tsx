"use client";

import { styled } from "@mui/material/styles";
import { useCallback, useRef, useState } from "react";

import { joinClassNames } from "@mcmm/utils";
import { useMounted, useResizeObserver } from "~/utils";

import type { ResizeObserverEntryCallback } from "~/utils";

//================================================

const Container = styled("div", { shouldForwardProp: prop => prop !== "hasOverflow" })<{
  hasOverflow: boolean;
}>(({ hasOverflow, theme }) => ({
  maxWidth: "100%",
  ...(hasOverflow
    ? {
        backgroundColor: theme.palette.background.paper,
        border: `1px solid ${theme.palette.divider}`,
        borderRadius: `${theme.shape.borderRadius}px`,
        overflow: "auto",
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

export type MatrixOverflowContainerProps = React.HTMLAttributes<HTMLDivElement> & {
  setColumnCount?: (value: number) => void;
};

export function MatrixOverflowContainer({
  setColumnCount,
  ...props
}: MatrixOverflowContainerProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [matrixHasOverflow, setMatrixHasOverflow] = useState(false);
  const onMatrixResize = useCallback<ResizeObserverEntryCallback>(
    entry => {
      if (setColumnCount) {
        const containerWidth = entry.target.classList.contains("mcmm-MatrixContainer")
          ? entry.target.clientWidth
          : entry.target.parentElement?.clientWidth;
        const cell = entry.target.getElementsByClassName("mcmm-Matrix__cell")[0];
        const header = entry.target.getElementsByClassName("mcmm-Matrix__header--left")[0];
        if (cell instanceof HTMLElement && header instanceof HTMLElement && containerWidth) {
          const cellWidth = cell.getBoundingClientRect().width;
          const headerWidth = header.getBoundingClientRect().width;
          const colCount = Math.floor((containerWidth - headerWidth) / cellWidth);
          console.log(`colCount: `, colCount);
          setColumnCount(colCount);
        }
      }
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
    },
    [setColumnCount],
  );

  useResizeObserver(ref.current, onMatrixResize);
  useResizeObserver(ref.current?.firstElementChild ?? null, onMatrixResize);
  useMounted();

  return (
    <Container
      hasOverflow={matrixHasOverflow}
      ref={ref}
      {...props}
      className={joinClassNames(
        "mcmm-MatrixContainer",
        matrixHasOverflow && "mcmm-MatrixContainer--overflow",
        props.className,
      )}
    />
  );
}
