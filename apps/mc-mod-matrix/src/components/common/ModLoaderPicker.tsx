"use client";

import { entries } from "lodash";

import { ModLoader } from "@mcmm/data";
import { makeRecordFromEntries } from "@mcmm/utils";
import { LoaderIcon } from "~/components";

import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";

import type { SelectProps } from "@mui/material/Select";

//================================================

const modLoaderEntries = entries(ModLoader);
const modLoaderLabels = makeRecordFromEntries(
  modLoaderEntries.map(([label, value]) => [value, label] as const),
);

const renderChip = (value: ModLoader, size: SelectProps["size"]) => (
  <Chip
    key={value}
    icon={<LoaderIcon loader={value} size={size === "small" ? 16 : 20} />}
    size={size}
    label={modLoaderLabels[value]}
  />
);

export type ModLoaderPickerProps = (
  | (SelectProps<ModLoader> & { multiple?: false })
  | (SelectProps<ModLoader[]> & { multiple: true })
) & {
  name: string;
};

export function ModLoaderPicker({ multiple, ...props }: ModLoaderPickerProps) {
  const labelId = `${props.id ?? props.name}-label`;
  return (
    <FormControl required={props.required}>
      <InputLabel id={labelId}>Mod loaders</InputLabel>
      <Select
        multiple={multiple}
        labelId={labelId}
        {...props}
        // @ts-expect-error: TS can't figure out how to pick the right union member
        renderValue={
          (multiple
            ? (selected: ModLoader[]) => (
                <Box display="flex" flexWrap="wrap" gap={1}>
                  {selected.map(value => renderChip(value, props.size))}
                </Box>
              )
            : (selected: ModLoader) =>
                renderChip(selected, props.size)) as ModLoaderPickerProps["renderValue"]
        }
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
  );
}
