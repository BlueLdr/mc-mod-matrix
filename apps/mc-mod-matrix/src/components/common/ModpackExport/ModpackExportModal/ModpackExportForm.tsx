"use client";

import { capitalize, values } from "lodash";
import { useMemo, useState } from "react";

import { ModListItem, PlatformIcon } from "~/components";
import { ExportJobHandler } from "~/data";
import { useRecommendedLoaderVersion } from "~/utils";
import { Platform } from "@mcmm/data";

import { ModLoaderVersionPicker } from "./ModLoaderVersionPicker";

import Typography from "@mui/material/Typography";
import InputLabel from "@mui/material/InputLabel";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Select from "@mui/material/Select";
import TextField from "@mui/material/TextField";
import Grid from "@mui/material/Grid";
import FormControl from "@mui/material/FormControl";
import MenuItem from "@mui/material/MenuItem";
import List from "@mui/material/List";

import type { ModpackExportParams } from "@mcmm/platform";
import type { Curseforge } from "@mcmm/curseforge";
import type { PackSupportMeta } from "@mcmm/data";

//================================================

export type ModpackExportFormProps = {
  packSupportMeta: PackSupportMeta;
  defaultAuthor?: string;
  formId: string;
  onSubmit: (params: ModpackExportParams) => void;
  disabled?: boolean;
};

export function ModpackExportForm({
  packSupportMeta,
  defaultAuthor,
  formId,
  onSubmit,
  disabled,
}: ModpackExportFormProps) {
  const [platform, setPlatform] = useState<Platform | null>(null);
  const [author, setAuthor] = useState(defaultAuthor);
  const [packVersion, setPackVersion] = useState("");
  const [fileName, setFileName] = useState<string>();

  const [selectedLoaderVersion, setSelectedLoaderVersion] =
    useState<Curseforge.MinecraftModLoaderIndex | null>(null);
  const recommendedLoaderVersion = useRecommendedLoaderVersion(
    packSupportMeta.gameVersion,
    packSupportMeta.loader,
  );

  const generatedFileName = useMemo(
    () =>
      platform && packVersion
        ? ExportJobHandler.getJobName({
            packSupportMeta,
            version: packVersion,
            platform,
          })
        : undefined,
    [platform, packVersion, packSupportMeta],
  );

  const modsNotFound = platform
    ? packSupportMeta.supportedMods.concat(packSupportMeta.supportedAlternativeMods).filter(
        m =>
          !m.versions
            .get(packSupportMeta.gameVersion)
            .get(packSupportMeta.loader)
            .find(v => v.platform === platform),
      )
    : [];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const modLoaderVersion = selectedLoaderVersion ?? recommendedLoaderVersion;
    if (!packVersion || !author || !modLoaderVersion || !platform) {
      return;
    }

    onSubmit({
      packSupportMeta,
      author,
      version: packVersion,
      modLoaderVersion: modLoaderVersion.name,
      platform,
      fileName: (fileName || generatedFileName) ?? "pack",
    });
  };

  return (
    <Grid
      component="form"
      id={formId}
      onSubmit={handleSubmit}
      container
      mt={2}
      flexDirection="column"
      rowGap={8}
    >
      <Grid container flexDirection="column">
        <FormControl required size="small">
          <InputLabel id="platform-label">Platform</InputLabel>
          <Select<Platform | null>
            labelId="platform-label"
            label="Platform"
            variant="outlined"
            size="small"
            value={platform ?? ""}
            disabled={disabled}
            renderValue={value =>
              value ? (
                <Grid container alignItems="center" gap={3}>
                  <PlatformIcon platform={value} size={20} />
                  <span>{capitalize(value)}</span>
                </Grid>
              ) : null
            }
            onChange={e => setPlatform(e.target.value as Platform)}
          >
            {values(Platform).map(value => (
              <MenuItem key={value} value={value}>
                <ListItemIcon>
                  <PlatformIcon platform={value} size={20} />
                </ListItemIcon>
                <ListItemText>{capitalize(value)}</ListItemText>
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        {platform && modsNotFound.length > 0 && (
          <Typography variant="caption" color="warning" mt={2}>
            The following mods are not available on {capitalize(platform)}.
          </Typography>
        )}
        {modsNotFound.length > 0 && (
          <List dense>
            {modsNotFound.map(m => (
              <ModListItem disablePadding key={m.id} mod={m} size="xs" />
            ))}
          </List>
        )}
      </Grid>

      <TextField
        required
        size="small"
        label="Author name"
        placeholder="Your username"
        value={author}
        onChange={e => setAuthor(e.target.value)}
        disabled={disabled}
      />

      <TextField
        required
        size="small"
        label="Modpack version"
        placeholder={
          packSupportMeta.pack.packVersion
            ? `Last version exported: ${packSupportMeta.pack.packVersion}`
            : "Example: 1.4.2"
        }
        value={packVersion}
        onChange={e => setPackVersion(e.target.value)}
        disabled={disabled}
      />

      <TextField
        size="small"
        label="Modpack name"
        placeholder={generatedFileName}
        value={fileName ?? ""}
        onChange={e => setFileName(e.target.value)}
        helperText="Leave blank to use the default generated name."
        disabled={disabled}
        slotProps={{
          input: {
            sx: {
              "& input:not(:focus):not(:active)::placeholder": {
                opacity: 0.75,
              },
            },
          },
          inputLabel: {
            shrink: !!generatedFileName,
          },
        }}
      />

      <ModLoaderVersionPicker
        size="small"
        name="loaderVersion"
        label={`${capitalize(packSupportMeta.loader)} loader version`}
        loader={packSupportMeta.loader}
        gameVersion={packSupportMeta.gameVersion}
        value={selectedLoaderVersion}
        onChange={(_, value) => setSelectedLoaderVersion(value)}
        disabled={disabled}
      />
    </Grid>
  );
}
