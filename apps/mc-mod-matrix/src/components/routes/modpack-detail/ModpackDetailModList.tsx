"use client";

import { Fragment, useContext, useEffect, useState } from "react";

import { classNameWithModifiers, pluralize } from "@mcmm/utils";
import { ModListItem, ModPicker } from "~/components";
import { DataRegistryContext, StorageContext } from "~/context";
import { MOD_DETAIL_MODAL_SEARCH_PARAM, useSearchParamSetter } from "~/utils";

import Divider from "@mui/material/Divider";
import Card from "@mui/material/Card";
import Edit from "@mui/icons-material/Edit";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import Grid from "@mui/material/Grid";
import List from "@mui/material/List";
import Typography from "@mui/material/Typography";

import type { ModMetadata, Modpack } from "@mcmm/data";

//================================================

export type ModpackDetailModListProps = {
  pack: Modpack;
};

export function ModpackDetailModList({ pack }: ModpackDetailModListProps) {
  const setModDetailTarget = useSearchParamSetter(MOD_DETAIL_MODAL_SEARCH_PARAM);
  const { updatePack } = useContext(StorageContext);
  const { dataRegistry } = useContext(DataRegistryContext);

  const [editMode, setEditMode] = useState(false);
  const [modList, setModList] = useState(() => pack.mods);
  useEffect(() => {
    if (!editMode) {
      setModList(pack.mods);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pack]);

  const onClickSave = () => {
    updatePack({
      ...pack,
      mods: modList,
    });
    setEditMode(false);
  };
  const onClickCancel = () => {
    setModList(pack.mods);
    setEditMode(false);
  };

  const [loadingMod, setLoadingMod] = useState<ModMetadata>();

  return (
    <Box marginBlock={6}>
      <Grid container mb={4} justifyContent="space-between" alignItems="center">
        <Grid container alignItems="center" spacing={3} sx={{ height: theme => theme.spacing(9) }}>
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
            if (details?.option) {
              setLoadingMod(details.option);
              dataRegistry?.storeMod(details.option, pack.versions.min).then(mod => {
                if (mod) {
                  setModList(prevState => [...prevState, mod]);
                  setLoadingMod(undefined);
                }
              });
            }
          }}
        />
      )}
      {modList.length > 0 && (
        <Card sx={{ marginBlock: 4 }}>
          <List>
            {modList.map((item, index) => (
              <Fragment key={item.id}>
                {index > 0 && <Divider />}
                <ModListItem
                  key={item.id}
                  mod={item}
                  showPlatforms="link"
                  onClick={() => setModDetailTarget(item.id)}
                  sx={{ paddingLeft: 4, paddingRight: editMode ? 12 : 4 }}
                  onRemove={
                    editMode
                      ? () => setModList(list => list.filter(m => m.id !== item.id))
                      : undefined
                  }
                  contentRight={
                    editMode ? undefined : (
                      <Grid
                        maxHeight={24}
                        className={classNameWithModifiers(
                          "mcmm-ModListItem__alternatives",
                          { "--empty": !item.alternatives?.length },
                          true,
                        )}
                      >
                        {!!item.alternatives?.length && (
                          <Chip
                            variant="outlined"
                            size="small"
                            color="primary"
                            label={`${item.alternatives.length} ${pluralize("Alternative", item.alternatives.length)}`}
                          />
                        )}
                      </Grid>
                    )
                  }
                />
              </Fragment>
            ))}
            {loadingMod && (
              <>
                {modList.length > 0 && <Divider />}
                <ModListItem
                  mod={loadingMod}
                  showPlatforms
                  loading
                  sx={{ paddingLeft: 4, paddingRight: editMode ? 12 : 4 }}
                />
              </>
            )}
          </List>
        </Card>
      )}
    </Box>
  );
}
