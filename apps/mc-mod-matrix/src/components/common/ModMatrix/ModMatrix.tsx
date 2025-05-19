"use client";

import { styled } from "@mui/material/styles";
import { capitalize } from "lodash";
import { Fragment, useContext, useMemo, useState } from "react";

import { getPackSupportForConfig } from "@mcmm/data";
import { gameVersionComparator } from "@mcmm/utils";
import { DataContext, DataRegistryContext } from "~/context";

import { ModMatrixItem } from "./ModMatrixItem";

import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import Box from "@mui/material/Box";
import PivotTableChart from "@mui/icons-material/PivotTableChart";

import type { TypographyProps } from "@mui/material/Typography";
import type { GameVersion, PackSupportMeta, Modpack, ModLoader } from "@mcmm/data";

//================================================

const Matrix = styled(Box)`
  width: fit-content;
  display: inline-grid;
  grid-auto-rows: auto;
  border: 1px solid ${({ theme }) => theme.palette.grey.A700};
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

type FilteredDataAndCols<T extends ModLoader[] | GameVersion[]> = [
  data: PackSupportMeta[][],
  cols: T,
];

export type ModMatrixProps = {
  pack: Modpack;
  disablePivot?: boolean;
  filterItems?: <T extends ModLoader[] | GameVersion[]>(
    ...args: FilteredDataAndCols<T>
  ) => FilteredDataAndCols<T>;
  onClickItem?: (item: PackSupportMeta, event: React.MouseEvent<HTMLDivElement>) => void;
};

export function ModMatrix({ pack, disablePivot, filterItems, onClickItem }: ModMatrixProps) {
  const {
    versions: { min: minVersion, max: maxVersion },
    loaders,
  } = pack;
  const { gameVersions } = useContext(DataContext);
  const { getMod } = useContext(DataRegistryContext);
  const versions = useMemo(
    () =>
      gameVersions.filter(
        ver =>
          gameVersionComparator(ver, maxVersion) <= 0 &&
          gameVersionComparator(ver, minVersion) >= 0,
      ),
    [gameVersions, minVersion, maxVersion],
  );

  const [pivoted, setPivoted] = useState(false);

  const rows = pivoted ? versions : loaders;
  const cols = pivoted ? loaders : versions;

  const data = useMemo(
    () =>
      // rows first
      rows.map(rowKey =>
        // then columns
        cols.map(colKey =>
          getPackSupportForConfig(
            pack,
            ...((pivoted ? [rowKey, colKey] : [colKey, rowKey]) as [string, ModLoader]),
            getMod,
          ),
        ),
      ),
    [rows, cols, pack, pivoted, getMod],
  );

  const [filteredData, filteredCols] = useMemo(() => {
    if (!filterItems) {
      return [data, cols] as const;
    }
    return filterItems(data, cols);
  }, [cols, data, filterItems]);

  return (
    <Matrix
      gridTemplateColumns={`5rem repeat(${filteredCols.length}, ${cols.length > rows.length ? "5rem" : "8rem"})`}
      gridTemplateRows={`auto repeat(${filteredData.length}, ${rows.length > cols.length ? "3rem" : "5rem"})`}
    >
      <Corner>
        {!disablePivot && (
          <IconButton onClick={() => setPivoted(!pivoted)}>
            <PivotTableChart />
          </IconButton>
        )}
      </Corner>
      {filteredCols.map(value => (
        <Typography {...headerProps} key={value}>
          {capitalize(value)}
        </Typography>
      ))}
      {filteredData.map(items => (
        <Fragment key={items[0]?.[pivoted ? "gameVersion" : "loader"]}>
          <Typography {...headerProps} justifyContent="flex-end">
            {pivoted ? items[0]?.gameVersion : capitalize(items[0]?.loader)}
          </Typography>
          {items.map(item => (
            <ModMatrixItem
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
