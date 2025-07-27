import { GameVersionPicker, ModLoaderPicker } from "~/components";

import Grid from "@mui/material/Grid";
import TextField from "@mui/material/TextField";

import type { StoredModpack, ModLoader } from "@mcmm/data";

//================================================

export const PACK_FORM_DEFAULT_DATA: Omit<StoredModpack, "id"> & { includeCommonMods: boolean } = {
  name: "",
  mods: [],
  versions: {
    min: "",
    max: "",
  },
  loaders: [],
  includeCommonMods: true,
};

export type PackFormProps = {
  formData: Omit<StoredModpack, "id">;
  setFormData: (data: Partial<Omit<StoredModpack, "id">>) => void;
  children?: React.ReactNode;
  hideLoaderField?: boolean;
  hideVersionFields?: boolean;
};

export function PackForm({
  formData,
  setFormData,
  children,
  hideVersionFields,
  hideLoaderField,
}: PackFormProps) {
  return (
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
      {!hideVersionFields && (
        <Grid
          container
          gridTemplateColumns="1fr 1fr"
          display="grid"
          alignItems="center"
          spacing={4}
          width="100%"
        >
          <GameVersionPicker
            value={formData.versions.min}
            multiple={false}
            onChange={(_, newValue) =>
              setFormData({
                versions: { min: newValue, max: formData.versions.max },
              })
            }
            required
            size="small"
            name="min-version"
            label="Min game version"
            maxVersion={formData.versions.max}
            disableClearable
          />

          <GameVersionPicker
            value={formData.versions.max}
            multiple={false}
            onChange={(_, newValue) =>
              setFormData({
                versions: { max: newValue, min: formData.versions.min },
              })
            }
            required
            size="small"
            name="max-version"
            label="Max game version"
            minVersion={formData.versions.min}
            disableClearable
          />
        </Grid>
      )}

      {!hideLoaderField && (
        <ModLoaderPicker
          name="loaders"
          size="small"
          variant="outlined"
          label="Mod loaders"
          multiple
          required
          value={formData.loaders}
          onChange={event => {
            const value = event.target.value;
            setFormData({
              loaders: typeof value === "string" ? (value.split(",") as ModLoader[]) : value,
            });
          }}
        />
      )}
      {children}
    </Grid>
  );
}
