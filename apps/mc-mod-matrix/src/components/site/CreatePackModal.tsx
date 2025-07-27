"use client";

import { entries } from "lodash";
import { useContext, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

import { makeRecordFromEntries, validateGameVersionRange } from "@mcmm/utils";
import { ModLoader } from "@mcmm/data";
import { useStateObject } from "~/utils";
import { CommonContext, CreatePackModalContext, StorageContext } from "~/context";
import { LoaderIcon, Modal } from "~/components";

import Box from "@mui/material/Box";
import Checkbox from "@mui/material/Checkbox";
import Chip from "@mui/material/Chip";
import FormControl from "@mui/material/FormControl";
import FormControlLabel from "@mui/material/FormControlLabel";
import InputLabel from "@mui/material/InputLabel";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import MenuItem from "@mui/material/MenuItem";
import Autocomplete from "@mui/material/Autocomplete";
import Button from "@mui/material/Button";
import Grid from "@mui/material/Grid";
import Select from "@mui/material/Select";
import TextField from "@mui/material/TextField";
import Tooltip from "@mui/material/Tooltip";

import type { StoredModpack } from "@mcmm/data";

//================================================

const CREATE_PACK_FORM_ID = "create-pack-form";

const modLoaderEntries = entries(ModLoader);
const modLoaderLabels = makeRecordFromEntries(
  modLoaderEntries.map(([label, value]) => [value, label] as const),
);

const defaultFormData: Omit<StoredModpack, "id"> & { includeCommonMods: boolean } = {
  name: "",
  mods: [],
  versions: {
    min: "",
    max: "",
  },
  loaders: [],
  includeCommonMods: true,
};

export function CreatePackModal() {
  const router = useRouter();
  const { open, setOpen } = useContext(CreatePackModalContext);
  const checkboxRef = useRef<HTMLButtonElement>(null);

  const { commonMods, addPack } = useContext(StorageContext);
  defaultFormData.includeCommonMods = !!commonMods.length;

  const [formData, setFormData] = useStateObject(defaultFormData);

  const { gameVersions } = useContext(CommonContext);
  const allowSubmit =
    !!formData.name &&
    !!formData.versions.min &&
    !!formData.versions.max &&
    !!formData.loaders.length;

  useEffect(() => {
    if (open) {
      setFormData(defaultFormData);
    }
  }, [open, setFormData]);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!allowSubmit) {
      return;
    }

    const { includeCommonMods, ...packData } = formData;
    if (includeCommonMods && commonMods.length) {
      packData.mods = commonMods;
    }
    validateGameVersionRange(packData.versions);
    const newId = addPack(packData);
    router.push(`/${encodeURIComponent(newId)}`);
    setOpen(false);
  };

  return (
    <Modal
      id="create-pack-modal"
      open={open}
      onClose={() => {
        setOpen(false);
        setFormData(defaultFormData);
      }}
      titleText="Create New Modpack"
      confirmButton={
        <Button disabled={!allowSubmit} type="submit" form={CREATE_PACK_FORM_ID}>
          Create
        </Button>
      }
      cancelButton={<Button>Cancel</Button>}
    >
      <form id={CREATE_PACK_FORM_ID} onSubmit={onSubmit}>
        <Grid container direction="column" spacing={4} marginBlock={2} width={400}>
          <TextField
            name="pack-name"
            value={formData.name}
            onChange={e => setFormData({ name: e.target.value })}
            label="Name"
            placeholder="Name"
            size="small"
            required
          />
          <Grid
            container
            gridTemplateColumns="1fr 1fr"
            display="grid"
            alignItems="center"
            spacing={4}
            width="100%"
          >
            <Autocomplete
              value={formData.versions.min}
              onChange={(_, newValue) =>
                setFormData({
                  versions: { min: newValue, max: formData.versions.max },
                })
              }
              renderInput={params => (
                <TextField
                  {...params}
                  required
                  size="small"
                  name="min-version"
                  label="Min game version"
                />
              )}
              size="small"
              disableClearable
              options={gameVersions}
            />

            <Autocomplete
              value={formData.versions.max}
              onChange={(_, newValue) =>
                setFormData({
                  versions: { max: newValue, min: formData.versions.min },
                })
              }
              renderInput={params => (
                <TextField
                  {...params}
                  required
                  size="small"
                  name="max-version"
                  label="Max game version"
                />
              )}
              size="small"
              disableClearable
              options={gameVersions}
            />
          </Grid>

          <FormControl required>
            <InputLabel id="loaders-label">Mod loaders</InputLabel>
            <Select
              name="loaders"
              size="small"
              variant="outlined"
              label="Mod loaders"
              labelId="loaders-label"
              multiple
              required
              value={formData.loaders}
              onChange={event => {
                const value = event.target.value;
                setFormData({
                  loaders: typeof value === "string" ? (value.split(",") as ModLoader[]) : value,
                });
              }}
              renderValue={selected => (
                <Box display="flex" flexWrap="wrap" gap={1}>
                  {selected.map(value => {
                    return (
                      <Chip
                        key={value}
                        icon={<LoaderIcon loader={value} size={16} />}
                        size="small"
                        label={modLoaderLabels[value]}
                      />
                    );
                  })}
                </Box>
              )}
            >
              {modLoaderEntries.map(([label, value]) => {
                return (
                  <MenuItem key={value} value={value}>
                    <ListItemIcon>
                      <LoaderIcon loader={value} size={20} />
                    </ListItemIcon>
                    <ListItemText>{label}</ListItemText>
                  </MenuItem>
                );
              })}
            </Select>
          </FormControl>
          <Tooltip
            title={
              commonMods.length
                ? undefined
                : `To use this feature, you first need to add some mods to your Common Mods list. Click "Manage data" in the sidebar to expand the menu, then click "Common mods".`
            }
            enterDelay={0}
            slotProps={{
              popper: {
                anchorEl: checkboxRef.current,
                placement: "top-start",
                modifiers: [
                  {
                    name: "offset",
                    options: {
                      offset: [0, -14],
                    },
                  },
                ],
              },
            }}
          >
            <FormControlLabel
              disabled={!commonMods.length}
              control={
                <Checkbox
                  ref={checkboxRef}
                  indeterminate={!commonMods.length}
                  checked={!commonMods.length || formData.includeCommonMods}
                  onChange={
                    !commonMods.length
                      ? undefined
                      : e => setFormData({ includeCommonMods: e.target.checked })
                  }
                />
              }
              label="Add your Common Mods to the new modpack automatically"
              slotProps={{
                typography: { variant: "caption" },
              }}
            />
          </Tooltip>
        </Grid>
      </form>
    </Modal>
  );
}
