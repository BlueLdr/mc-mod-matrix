"use client";

import { styled } from "@mui/material/styles";
import { capitalize } from "lodash";
import { Fragment, useContext, useMemo, useState } from "react";

import { ModMatrixItem } from "./ModMatrixItem";
import { DataContext } from "~/context";
import { getPackSupportForConfig } from "@mcmm/data";
import { gameVersionComparator } from "@mcmm/utils";

import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import Box from "@mui/material/Box";
import PivotTableChart from "@mui/icons-material/PivotTableChart";

import type { Modpack, ModLoader } from "@mcmm/data";

//================================================

const Matrix = styled(Box)`
  display: grid;
  grid-auto-rows: auto;
  border-bottom: 1px solid ${({ theme }) => theme.palette.grey.A700};
  border-right: 1px solid ${({ theme }) => theme.palette.grey.A700};
`;

export type ModMatrixProps = { pack: Modpack; disablePivot?: boolean };

export function ModMatrix({ pack, disablePivot }: ModMatrixProps) {
  const {
    versions: { min: minVersion, max: maxVersion },
    loaders,
  } = pack;
  const { gameVersions } = useContext(DataContext);
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
          ),
        ),
      ),
    [pack, loaders, versions, pivoted],
  );

  return (
    <Matrix gridTemplateColumns={`repeat(${cols.length + 1}, 5rem)`}>
      <div>
        {!disablePivot && (
          <IconButton onClick={() => setPivoted(!pivoted)}>
            <PivotTableChart />
          </IconButton>
        )}
      </div>
      {cols.map(value => (
        <Typography
          component="div"
          p={2}
          variant="body2"
          fontWeight="600"
          key={value}
          textAlign="center"
        >
          {capitalize(value)}
        </Typography>
      ))}
      {data.map(items => (
        <Fragment key={items[0]?.[pivoted ? "gameVersion" : "loader"]}>
          <Typography component="div" p={2} variant="body2" fontWeight="600" textAlign="right">
            {pivoted ? capitalize(items[0]?.gameVersion) : items[0]?.loader}
          </Typography>
          {items.map(item => (
            <ModMatrixItem key={`${item.loader}${item.gameVersion}`} data={item} />
          ))}
        </Fragment>
      ))}
    </Matrix>
  );
}
