"use client";

import { styled } from "@mui/material/styles";
import { capitalize, uniq } from "lodash";
import { Fragment, useMemo, useState } from "react";

import { ModMatrixItem } from "./ModMatrixItem";

import Card from "@mui/material/Card";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import PivotTableChart from "@mui/icons-material/PivotTableChart";

import type { TypographyProps } from "@mui/material/Typography";
import type { PackSupportMeta, ModLoader } from "@mcmm/data";

//================================================

const Matrix = styled(Card)`
  width: fit-content;
  display: inline-grid;
  grid-auto-rows: auto;
  overflow: visible;
  border: 1px solid ${({ theme }) => theme.palette.divider};
`;

const Cell = styled(ModMatrixItem)`
  &:last-child {
    border-bottom-right-radius: inherit;
  }
`;

const Corner = styled("div")`
  display: flex;
  justify-content: flex-end;
  align-items: flex-end;
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

export type ModMatrixProps = {
  data: PackSupportMeta[];
  disablePivot?: boolean;
  onClickItem?: (item: PackSupportMeta, event: React.MouseEvent<HTMLDivElement>) => void;
};

export function ModMatrix({ data, disablePivot, onClickItem }: ModMatrixProps) {
  const [pivoted, setPivoted] = useState(false);

  const [loaders, versions, itemMap] = useMemo(() => {
    // @ts-expect-error: initially empty
    const itemMap: Record<ModLoader, Record<string, PackSupportMeta>> = {};
    return [
      uniq(data.map(item => item.loader)),
      uniq(
        data.map(item => {
          itemMap[item.loader] = itemMap[item.loader] ?? {};
          (itemMap[item.loader] as Record<string, PackSupportMeta>)[item.gameVersion] = item;
          return item.gameVersion;
        }),
      ),
      itemMap,
    ];
  }, [data]);

  const rows = pivoted ? versions : loaders;
  const cols = pivoted ? loaders : versions;
  const items = useMemo(
    () =>
      // rows first
      rows.map(rowKey =>
        // then columns
        cols.map(
          colKey => itemMap[(pivoted ? colKey : rowKey) as ModLoader]?.[pivoted ? rowKey : colKey],
        ),
      ),
    [cols, itemMap, pivoted, rows],
  );

  return (
    <Matrix
      className="mcmm-Matrix"
      sx={{
        gridTemplateColumns: `5rem repeat(${cols.length}, ${cols.length > rows.length ? "5rem" : "8rem"})`,
        gridTemplateRows: `auto repeat(${items.length}, ${rows.length > cols.length ? "3rem" : "5rem"})`,
      }}
    >
      <Corner className="mcmm-Matrix__header mcmm-Matrix__header--top mcmm-Matrix__header--left">
        {!disablePivot && (
          <IconButton onClick={() => setPivoted(!pivoted)}>
            <PivotTableChart />
          </IconButton>
        )}
      </Corner>
      {cols.map(value => (
        <Typography
          {...headerProps}
          className="mcmm-Matrix__header mcmm-Matrix__header--top"
          key={value}
        >
          {capitalize(value)}
        </Typography>
      ))}
      {items.map((rowItems, i) => (
        <Fragment key={rowItems[0]?.[pivoted ? "gameVersion" : "loader"]}>
          <Typography
            {...headerProps}
            className={`mcmm-Matrix__header mcmm-Matrix__header--left${i === items.length - 1 ? " mcmm-Matrix__header--bottom" : ""}`}
            justifyContent="flex-end"
          >
            {pivoted ? rowItems[0]?.gameVersion : capitalize(rowItems[0]?.loader)}
          </Typography>
          {rowItems.map(item => (
            <Cell
              key={`${item.loader}${item.gameVersion}`}
              data={item}
              onClick={onClickItem ? e => onClickItem(item, e) : undefined}
            />
          ))}
        </Fragment>
      ))}
    </Matrix>
  );
}
