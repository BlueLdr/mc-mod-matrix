"use client";

import { useMemo, useRef } from "react";

import { Icon } from "~/components";
import { useModSearch } from "~/data-utils";

import { ModDetailPlatformItemContent } from "./ModDetailPlatformItemContent";

import useAutocomplete from "@mui/material/useAutocomplete";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import Grid from "@mui/material/Grid";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import MenuItem from "@mui/material/MenuItem";
import MenuList from "@mui/material/MenuList";
import Popover from "@mui/material/Popover";
import TextField from "@mui/material/TextField";

import type { Platform, PlatformModMetadata } from "@mcmm/data";
import type { RequestStatus } from "@mcmm/api";

//================================================

const ident = <T = any,>(x: T) => x;

function Picker({
  value,
  onChange,
  options,
  status,
  inputValue,
  setInputValue,
  platform,
  closeEditor,
}: ModDetailPlatformEditorProps & {
  options: PlatformModMetadata[];
  status: RequestStatus;
  inputValue: string;
  setInputValue: React.Dispatch<React.SetStateAction<string>>;
}) {
  const { getInputLabelProps, getInputProps, getListboxProps, getOptionProps, groupedOptions } =
    useAutocomplete<PlatformModMetadata, false, false, false>({
      inputValue,
      onInputChange: (_, newValue) => setInputValue(newValue),
      filterSelectedOptions: true,
      filterOptions: ident,
      getOptionLabel: option => option.modName,
      getOptionKey: opt => opt.id,
      isOptionEqualToValue: (opt, value) => opt.id === value.id,
      options: status.success || status.pending ? options : emptyOptions,
      getOptionDisabled: () => status.pending,
      value: value || null,
      onChange: (_, newMeta) => onChange(platform, newMeta || undefined).then(() => closeEditor()),
      open: true,
    });

  const { ref, size, color, ...inputProps } = getInputProps();

  return (
    <>
      <Grid container wrap="nowrap" gap={2}>
        <TextField
          inputRef={ref}
          {...inputProps}
          label="Search for a mod..."
          value={inputValue}
          size="small"
          slotProps={{
            inputLabel: getInputLabelProps(),
          }}
          sx={{
            flex: "1 1 100%",
          }}
        />
        <Button
          variant="outlined"
          size="small"
          color="primary"
          sx={{ flex: "0 0 auto" }}
          onClick={() => onChange(platform, undefined).then(() => closeEditor())}
        >
          Remove
        </Button>
      </Grid>
      <MenuList
        {...getListboxProps()}
        sx={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          p: 1,
          gap: 2,
        }}
      >
        {groupedOptions.map((option, index) => {
          const { key, ...optionProps } = getOptionProps({ option, index });
          return (
            <MenuItem
              key={key}
              {...optionProps}
              sx={{ gap: 4, maxWidth: theme => theme.spacing(80) }}
              title={`${option.modName}\n\n${option.modDescription}`}
            >
              <ListItemIcon>
                <Icon size={36} src={option.thumbnailUrl} />
              </ListItemIcon>
              <ListItemText
                primary={option.modName}
                slotProps={{
                  primary: { sx: { textOverflow: "ellipsis", overflow: "hidden" } },
                }}
                secondary={option.authorName}
              />
            </MenuItem>
          );
        })}
      </MenuList>
    </>
  );
}

//================================================

const emptyOptions: PlatformModMetadata[] = [];

export type ModDetailPlatformEditorProps = {
  platform: Platform;
  value: PlatformModMetadata | undefined;
  onChange: (platform: Platform, newMeta: PlatformModMetadata | undefined) => Promise<unknown>;
  closeEditor: () => void;
};

export function ModDetailPlatformEditor({
  platform,
  value,
  closeEditor,
  onChange,
}: ModDetailPlatformEditorProps) {
  const anchorRef = useRef<HTMLDivElement>(null);

  const [inputValue, setInputValue, _options, status] = useModSearch({
    platforms: useMemo(() => [platform], [platform]),
  });

  const options = useMemo(
    () => _options?.map(meta => meta.platforms.get(platform)).filter(opt => !!opt) ?? emptyOptions,
    [_options, platform],
  );

  return (
    <>
      <Card ref={anchorRef} sx={{ m: -2, p: theme => `calc(${theme.spacing(2)} - 1px)` }}>
        <ModDetailPlatformItemContent meta={value} />
      </Card>
      <Popover
        open
        keepMounted
        onClose={closeEditor}
        anchorEl={() => anchorRef.current}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "left",
        }}
        slotProps={{
          paper: {
            sx: {
              p: 2,
              pt: 3,
            },
          },
        }}
      >
        <Picker
          {...{
            platform,
            value,
            onChange,
            closeEditor,
            options,
            status,
            inputValue,
            setInputValue,
          }}
        />
      </Popover>
    </>
  );
}
