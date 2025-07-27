"use client";

import { useContext, useMemo } from "react";

import { gameVersionComparator } from "@mcmm/utils";
import { CommonContext } from "~/context";

import Autocomplete from "@mui/material/Autocomplete";
import TextField from "@mui/material/TextField";

import type { AutocompleteProps } from "@mui/material/Autocomplete";
import type { GameVersion } from "@mcmm/data";
import type { DistributiveOmit } from "@mcmm/types";

//================================================

export type GameVersionPickerProps<
  Multiple extends boolean,
  DisableClearable extends boolean,
  FreeSolo extends boolean,
> = DistributiveOmit<
  AutocompleteProps<GameVersion, Multiple, DisableClearable, FreeSolo>,
  "options" | "renderInput"
> & {
  name: string;
  label?: React.ReactNode;
  minVersion?: GameVersion;
  maxVersion?: GameVersion;
  renderInput?: AutocompleteProps<GameVersion, Multiple, DisableClearable, FreeSolo>["renderInput"];
  required?: boolean;
};

export function GameVersionPicker<
  Multiple extends boolean,
  DisableClearable extends boolean,
  FreeSolo extends boolean,
>({
  minVersion,
  maxVersion,
  name,
  label,
  required,
  ...props
}: GameVersionPickerProps<Multiple, DisableClearable, FreeSolo>) {
  const { gameVersions } = useContext(CommonContext);

  const options = useMemo(() => {
    let opts = gameVersions;
    if (minVersion) {
      opts = opts.filter(v => gameVersionComparator(v, minVersion) >= 0);
    }
    if (maxVersion) {
      opts = opts.filter(v => gameVersionComparator(v, maxVersion) <= 0);
    }
    return opts;
  }, [gameVersions, maxVersion, minVersion]);

  return (
    <Autocomplete
      renderInput={params => (
        <TextField {...params} required={required} size={props.size} name={name} label={label} />
      )}
      {...props}
      options={options}
    />
  );
}
