"use client";

import { Fragment, useContext, useEffect, useState } from "react";

import { ModListItem, ModPicker } from "~/components";
import { DataContext, DataRegistryContext } from "~/context";

import Divider from "@mui/material/Divider";
import Card from "@mui/material/Card";
import Edit from "@mui/icons-material/Edit";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Grid from "@mui/material/Grid";
import List from "@mui/material/List";
import Typography from "@mui/material/Typography";

import type { Modpack } from "@mcmm/data";

//================================================

export type ModpackDetailModListProps = {
  pack: Modpack;
};

export function ModpackDetailModList({ pack }: ModpackDetailModListProps) {
  const { updatePack } = useContext(DataContext);
  const { storeMod, getMod } = useContext(DataRegistryContext);

  const [modList, setModList] = useState(() => pack.mods.map(mod => mod.meta));
  useEffect(() => {
    setModList(pack.mods.map(mod => mod.meta));
  }, [pack]);

  const [editMode, setEditMode] = useState(false);

  const onClickSave = () => {
    updatePack({
      ...pack,
      mods: modList.map(meta => getMod(meta.slug)).filter(m => !!m),
    });
    setEditMode(false);
  };
  const onClickCancel = () => {
    setModList(pack.mods.map(mod => mod.meta));
    setEditMode(false);
  };

  return (
    <Box marginBlock={6}>
      <Grid container mb={4} justifyContent="space-between" alignItems="center">
        <Grid container alignItems="center" spacing={3}>
          <Typography variant="h6">Mods</Typography>
          <Typography variant="overline">{modList.length}</Typography>
        </Grid>
        {editMode ? (
          <Grid container alignItems="center" spacing={3}>
            <Button variant="outlined" onClick={onClickCancel}>
              Cancel
            </Button>
            <Button variant="contained" onClick={onClickSave}>
              Save
            </Button>
          </Grid>
        ) : (
          <Button variant="outlined" startIcon={<Edit />} onClick={() => setEditMode(true)}>
            Edit
          </Button>
        )}
      </Grid>
      {editMode && (
        <ModPicker
          size="small"
          value={modList}
          onChange={(_, newValue, __, details) => {
            setModList(newValue);
            if (details?.option) {
              storeMod(details.option, pack.versions.min);
            }
          }}
        />
      )}
      <Card variant="outlined" sx={{ paddingInline: 4, marginBlock: 4 }}>
        <List>
          {modList.map((item, index) => (
            <Fragment key={item.slug}>
              {index > 0 && <Divider />}
              <ModListItem
                key={item.slug}
                mod={item}
                showPlatforms="link"
                onRemove={
                  editMode
                    ? mod => setModList(list => list.filter(m => m.slug !== mod.slug))
                    : undefined
                }
              />
            </Fragment>
          ))}
        </List>
      </Card>
    </Box>
  );
}
