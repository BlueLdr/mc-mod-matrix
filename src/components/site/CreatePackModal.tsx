"use client";

import { entries } from "lodash";
import { useContext } from "react";
import { useRouter } from "next/navigation";

import { LoaderIcon, Modal } from "~/components";
import { CreatePackModalContext, DataContext } from "~/context";
import { useStateObject } from "~/utils";
import { ModLoader, type Modpack } from "~/data";

import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import MenuItem from "@mui/material/MenuItem";
import Autocomplete from "@mui/material/Autocomplete";
import Button from "@mui/material/Button";
import Grid from "@mui/material/Grid";
import Select from "@mui/material/Select";
import TextField from "@mui/material/TextField";

//================================================

const CREATE_PACK_FORM_ID = "create-pack-form";

const modLoaderEntries = entries(ModLoader);
const modLoaderLabels = Object.fromEntries(
  modLoaderEntries.map(([label, value]) => [value, label] as const),
);

const defaultFormData: Modpack = {
  name: "",
  mods: [],
  versions: {
    min: "",
    max: "",
  },
  loaders: [],
};

export function CreatePackModal() {
  const router = useRouter();
  const { open, setOpen } = useContext(CreatePackModalContext);
  const [formData, setFormData] = useStateObject(defaultFormData);

  const { addPack, gameVersions } = useContext(DataContext);
  const allowSubmit =
    !!formData.name &&
    !!formData.versions.min &&
    !!formData.versions.max &&
    !!formData.loaders.length;
  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!allowSubmit) {
      return;
    }
    addPack(formData);
    router.push(`/${encodeURIComponent(formData.name)}`);
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
      titleText="Create New Mod Pack"
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

          <FormControl>
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
        </Grid>
      </form>
    </Modal>
  );
}
