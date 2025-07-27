"use client";

import { Fragment, useContext, useEffect, useState } from "react";

import { ModListItem, ModPicker } from "~/components";
import { DataRegistryContext } from "~/context";

import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import Divider from "@mui/material/Divider";
import Grid from "@mui/material/Grid";
import List from "@mui/material/List";
import Typography from "@mui/material/Typography";
import Edit from "@mui/icons-material/Edit";

import type { BoxProps } from "@mui/material/Box";
import type { ModListItemProps } from "~/components";
import type { DistributivePick, ValueAndSetter } from "@mcmm/types";
import type { GameVersion, Mod, ModMetadata } from "@mcmm/data";

//================================================

export type ModListEditableProps = ValueAndSetter<"editMode", boolean> &
  DistributivePick<ModListItemProps, "size" | "showPlatforms"> & {
    formId?: string;
    hideHeaderButton?: boolean;
    items: Mod[];
    onSave: (newList: Mod[]) => void;
    onClickItem?: (e: React.MouseEvent<HTMLLIElement>, item: Mod) => void;
    getItemContentLeft?: (item: Mod) => React.ReactNode;
    getItemContentRight?: (item: Mod) => React.ReactNode;
    minGameVersion?: GameVersion;
  };

export function ModListEditable({
  editMode,
  setEditMode,
  items,
  onSave,
  size,
  showPlatforms,
  onClickItem,
  getItemContentRight,
  getItemContentLeft,
  minGameVersion,
  hideHeaderButton,
  formId,
}: ModListEditableProps) {
  const { dataRegistry } = useContext(DataRegistryContext);

  const [modList, setModList] = useState(items);
  useEffect(() => {
    if (!editMode) {
      setModList(items);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items]);

  const onClickSave = () => {
    onSave(modList);
    setEditMode(false);
  };
  const onClickCancel = () => {
    setModList(items);
    setEditMode(false);
  };

  const [loadingMod, setLoadingMod] = useState<ModMetadata>();

  const containerProps = formId
    ? ({
        component: "form",
        id: formId,
        onSubmit: e => {
          e.preventDefault();
          onClickSave();
        },
      } satisfies BoxProps)
    : {};

  return (
    <Box className="mcmm-ModListEditable" {...containerProps}>
      <Grid
        className="mcmm-ModListEditable__header"
        container
        mb={4}
        justifyContent="space-between"
        alignItems="center"
      >
        <Grid
          container
          alignItems="center"
          spacing={3}
          sx={hideHeaderButton ? undefined : { height: theme => theme.spacing(9) }}
        >
          <Typography variant="h6">Mods</Typography>
          <Typography variant="overline">{modList.length}</Typography>
        </Grid>
        {hideHeaderButton ? null : editMode ? (
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
          className="mcmm-ModListEditable__input"
          size={size === "lg" || size === "xl" ? "medium" : "small"}
          value={modList}
          onChange={(_, newValue, __, details) => {
            if (details?.option) {
              setLoadingMod(details.option);
              dataRegistry?.storeMod(details.option, minGameVersion).then(mod => {
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
        <Box className="mcmm-ModListEditable__list">
          <Card sx={{ marginBlock: 4 }}>
            <List>
              {modList.map((item, index) => (
                <Fragment key={item.id}>
                  {index > 0 && <Divider />}
                  <ModListItem
                    key={item.id}
                    mod={item}
                    size={size}
                    showPlatforms={showPlatforms}
                    onClick={e => onClickItem?.(e, item)}
                    sx={{ paddingLeft: 4, paddingRight: editMode ? 12 : 4 }}
                    onRemove={
                      editMode
                        ? () => setModList(list => list.filter(m => m.id !== item.id))
                        : undefined
                    }
                    contentRight={getItemContentRight?.(item)}
                    contentLeft={getItemContentLeft?.(item)}
                  />
                </Fragment>
              ))}
              {loadingMod && (
                <>
                  {modList.length > 0 && <Divider />}
                  <ModListItem
                    mod={loadingMod}
                    showPlatforms={!!showPlatforms}
                    loading
                    sx={{ paddingLeft: 4, paddingRight: editMode ? 12 : 4 }}
                  />
                </>
              )}
            </List>
          </Card>
        </Box>
      )}
    </Box>
  );
}
