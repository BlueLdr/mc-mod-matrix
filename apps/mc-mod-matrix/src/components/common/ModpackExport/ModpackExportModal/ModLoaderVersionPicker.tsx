"use client";

import { styled } from "@mui/material/styles";
import { useContext, useEffect, useMemo, useState } from "react";

import { comparator } from "@mcmm/utils";
import { formatLoaderVersion } from "@mcmm/data";
import { curseforgeApi } from "@mcmm/curseforge";
import { CommonContext } from "~/context";
import { useApiRequest } from "~/utils";

import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Autocomplete from "@mui/material/Autocomplete";
import TextField from "@mui/material/TextField";

import type { AutocompleteProps } from "@mui/material/Autocomplete";
import type { ModLoader, GameVersion } from "@mcmm/data";
import type { DistributiveOmit } from "@mcmm/types";
import type { Curseforge } from "@mcmm/curseforge";

//================================================

const Option = styled("li")({
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  width: "100%",
});

type LoaderVersionOption = Omit<Curseforge.MinecraftModLoaderIndex, "name"> & {
  label?: string;
  name: Curseforge.MinecraftModLoaderIndex["name"] | "auto";
};

const isNotAutoOption = (
  option: LoaderVersionOption | undefined | null,
): option is Curseforge.MinecraftModLoaderIndex => !!option && option.name !== "auto";

const AUTO_TEXT = "Auto (use the recommended version)";

const renderOption: AutocompleteProps<LoaderVersionOption, false, false, false>["renderOption"] = (
  { key, ...props },
  option,
) => {
  let content: React.ReactNode = option.label;
  if (option.recommended || option.latest) {
    content = (
      <>
        <Box flex={1}>{content}</Box>
        <Typography variant="caption">
          {[option.recommended && "Recommended", option.latest && "Latest"]
            .filter(s => !!s)
            .join(", ")}
        </Typography>
      </>
    );
  }
  return (
    <Option key={key} {...props}>
      {content}
    </Option>
  );
};

//================================================

export type ModLoaderVersionPickerProps = DistributiveOmit<
  AutocompleteProps<Curseforge.MinecraftModLoaderIndex, false, false, false>,
  "options" | "renderInput"
> & {
  name: string;
  label?: React.ReactNode;
  loader: ModLoader;
  gameVersion: GameVersion;
  renderInput?: AutocompleteProps<
    Curseforge.MinecraftModLoaderIndex,
    false,
    false,
    false
  >["renderInput"];
};

export function ModLoaderVersionPicker({
  value,
  onChange,
  loader,
  gameVersion,
  disableClearable,
  name,
  label,
  ...props
}: ModLoaderVersionPickerProps) {
  const { loaderVersions, setLoaderVersions } = useContext(CommonContext);
  const versions = useMemo(
    () =>
      loaderVersions[loader]?.[gameVersion]
        ?.slice()
        ?.sort(comparator("desc", v => new Date(v.dateModified).getTime())),
    [gameVersion, loader, loaderVersions],
  );

  const [inputValue, setInputValue] = useState(() =>
    value != null ? formatLoaderVersion(value.name)[1] : "",
  );

  const options = useMemo(() => {
    const opts = [
      {
        name: "auto",
        label: AUTO_TEXT,
      } as LoaderVersionOption,
    ];
    if (!versions) {
      return opts;
    }
    const recommendedFound = { current: false };
    return [
      ...opts,
      ...versions.map((v, i) => {
        const recFound = recommendedFound.current;
        recommendedFound.current = recommendedFound.current || v.recommended;
        return {
          ...v,
          label: formatLoaderVersion(v.name)[1],
          latest: i === 0,
          recommended: v.recommended && !recFound,
        } as LoaderVersionOption;
      }),
    ];
  }, [versions]);

  const [fetchVersions, , status, reset] = useApiRequest<
    Parameters<typeof curseforgeApi.getMinecraftLoaderVersions>,
    {
      data: Curseforge.MinecraftModLoaderIndex[];
    }
  >((...args) => curseforgeApi.getMinecraftLoaderVersions(...args));

  useEffect(() => {
    return () => reset();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loader, gameVersion]);

  useEffect(() => {
    if (!versions?.length) {
      fetchVersions({ version: gameVersion, includeAll: true }).then(({ data }) => {
        if (data && data.data.length) {
          setLoaderVersions(data.data);
        }
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameVersion, loader]);

  return (
    // @ts-expect-error: auto option will never be selected
    <Autocomplete<LoaderVersionOption, false, false, false>
      renderInput={params => (
        <TextField
          {...params}
          required={disableClearable}
          size={props.size}
          name={name}
          label={label}
          placeholder={AUTO_TEXT}
          sx={{
            "& input:not(:focus):not(:active)::placeholder": {
              opacity: 0.75,
            },
          }}
          inputProps={{
            ...params.inputProps,
            value: params.inputProps.value === AUTO_TEXT ? "" : params.inputProps.value,
          }}
          slotProps={{
            inputLabel: {
              shrink: true,
            },
          }}
        />
      )}
      {...props}
      value={value}
      openOnFocus
      inputValue={inputValue}
      onInputChange={(_, val) => setInputValue(val === AUTO_TEXT ? "" : val)}
      isOptionEqualToValue={(opt, val) => opt.name === val.name}
      getOptionKey={option => option.name ?? "auto"}
      getOptionLabel={option => option.label ?? option.name ?? AUTO_TEXT}
      renderOption={renderOption}
      options={options}
      loading={!options?.length || status.pending}
      onChange={(_, v, reason, details) => {
        const option = details?.option;
        if (!isNotAutoOption(v) || !isNotAutoOption(option)) {
          onChange?.(_, null, reason);
        } else {
          onChange?.(_, v as Curseforge.MinecraftModLoaderIndex, reason, { option });
        }
      }}
    />
  );
}
