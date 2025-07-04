"use client";

import { styled } from "@mui/material/styles";
import { Fragment } from "react";

import Card from "@mui/material/Card";
import Skeleton from "@mui/material/Skeleton";
import Typography from "@mui/material/Typography";

import type { TypographyProps } from "@mui/material/Typography";

//================================================

const Matrix = styled(Card)`
  width: fit-content;
  display: inline-grid;
  grid-auto-rows: auto;
  overflow: visible;
  border: 1px solid ${({ theme }) => theme.palette.divider};
`;

const Cell = styled(Skeleton)(({ theme }) => ({
  border: `1px solid ${theme.palette.divider}`,
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  padding: theme.spacing(2),
  marginBottom: "-1px",
  marginRight: "-1px",
  "&:last-child": {
    borderBottomRightRadius: "inherit",
  },
}));

const Corner = styled("div")`
  display: flex;
  justify-content: flex-end;
  align-items: flex-end;
`;

const HeaderText = styled(Skeleton)`
  width: 100%;
`;

const headerProps: TypographyProps = {
  component: "div",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  p: 2,
  variant: "body2",
  fontWeight: "600",
};

//================================================

export type ModMatrixLoadingProps = { rowCount?: number; colCount?: number; fitWidth?: boolean };

export function ModMatrixLoading({ rowCount = 3, colCount = 5, fitWidth }: ModMatrixLoadingProps) {
  const items = new Array(rowCount).fill(undefined).map(() => new Array(colCount).fill(undefined));

  const colWidth = colCount > rowCount ? "5rem" : "8rem";

  return (
    <Matrix
      className="mcmm-Matrix"
      sx={{
        gridTemplateColumns: `5rem repeat(${colCount}, ${fitWidth ? `minmax(0, ${colWidth})` : colWidth})`,
        gridTemplateRows: `auto repeat(${items.length}, ${rowCount > colCount ? "3rem" : "5rem"})`,
        maxWidth: fitWidth ? "100%" : undefined,
      }}
    >
      <Corner className="mcmm-Matrix__header mcmm-Matrix__header--top mcmm-Matrix__header--left" />
      {items[0].map((_, i) => (
        <Typography
          {...headerProps}
          className="mcmm-Matrix__header mcmm-Matrix__header--top"
          key={i}
        >
          <HeaderText />
        </Typography>
      ))}
      {items.map((rowItems, i) => (
        <Fragment key={i}>
          <Typography
            {...headerProps}
            className={`mcmm-Matrix__header mcmm-Matrix__header--left${i === items.length - 1 ? " mcmm-Matrix__header--bottom" : ""}`}
            justifyContent="flex-end"
          >
            <HeaderText />
          </Typography>
          {rowItems.map((_, i) => (
            <Cell variant="rectangular" key={i} sx={{ height: "unset", maxWidth: colWidth }} />
          ))}
        </Fragment>
      ))}
    </Matrix>
  );
}
