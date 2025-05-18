"use client";

import { debounce, uniq } from "lodash";
import { useEffect, useMemo, useState } from "react";

import {
  getCurseforgeModMetadata,
  getCurseforgeModMetadataFromSearch,
  getModrinthModMetadata,
} from "@mcmm/data";
import { curseforgeApi, modrinthApi } from "@mcmm/api";
import { useApiRequest } from "~/utils";
import { ModListItem } from "./ModListItem";
import { VirtualizedListbox } from "./VirtualizedListBox";

import Autocomplete from "@mui/material/Autocomplete";
import MenuItem from "@mui/material/MenuItem";
import TextField from "@mui/material/TextField";

import type { ModMetadata } from "@mcmm/data";
import type { ListChildComponentProps } from "react-window";
import type { AutocompleteProps, AutocompleteRenderOptionState } from "@mui/material/Autocomplete";
import type { DistributiveOmit } from "@mcmm/types";

// ================================================================

const searchMods = async (text: string) => {
  const modrinthResults = await modrinthApi.searchMods(text);
  const curseforgeResults = await curseforgeApi.searchMods(text);

  const modrinthMap = new Map(modrinthResults.data?.hits.map(item => [item.slug, item]));
  const curseforgeMap = new Map(curseforgeResults.data?.data?.map(item => [item.slug, item]));

  const modrinthSlugs = Array.from(modrinthMap.keys());
  const curseforgeSlugs = Array.from(curseforgeMap.keys());
  const uniqueSlugs = uniq([...modrinthSlugs, ...curseforgeSlugs]).sort((a, b) => {
    const aIndex = modrinthMap.has(a) ? modrinthSlugs.indexOf(a) : curseforgeSlugs.indexOf(a);
    const bIndex = modrinthMap.has(b) ? modrinthSlugs.indexOf(b) : curseforgeSlugs.indexOf(b);
    return aIndex - bIndex;
  });

  const unifiedResults: ModMetadata[] = [];
  for (const slug of uniqueSlugs) {
    const modrinthItem = modrinthMap.get(slug);
    const curseforgeItem = curseforgeMap.get(slug);
    unifiedResults.push({
      name: modrinthItem?.title ?? curseforgeItem!.name,
      slug: modrinthItem?.slug ?? curseforgeItem!.slug,
      image: modrinthItem?.icon_url ?? curseforgeItem!.thumbnailUrl,
      curseforge: curseforgeItem ? getCurseforgeModMetadataFromSearch(curseforgeItem) : undefined,
      modrinth: modrinthItem ? getModrinthModMetadata(modrinthItem) : undefined,
    });
  }

  return { data: unifiedResults };
};

const ident = <T = any,>(x: T) => x;

const renderOption = (
  props: React.HTMLAttributes<HTMLLIElement>,
  option: ModMetadata,
  state: AutocompleteRenderOptionState,
): React.ReactNode => [props, option, state] as any;

const renderVisualOption = (props: ListChildComponentProps<Parameters<typeof renderOption>[]>) => {
  const { data, index, style } = props;
  const dataSet = data[index];
  const [rowProps, metadata, state] = dataSet;
  const inlineStyle = {
    ...style,
    top: (style.top as number) + 8,
  };
  return (
    <ModListItem
      mod={metadata}
      showPlatforms
      component={MenuItem}
      {...rowProps}
      key={metadata.slug}
      selected={state.selected}
      style={inlineStyle}
    />
  );
};

const emptyOptions: ModMetadata[] = [];

// ================================================================

export type ModPickerProps = DistributiveOmit<
  AutocompleteProps<ModMetadata, true, true, false>,
  | "filterSelectedOptions"
  | "filterOptions"
  | "options"
  | "getOptionLabel"
  | "renderOption"
  | "inputValue"
  | "onInputChange"
  | "renderInput"
>;

export function ModPicker(props: ModPickerProps) {
  // const [localValue, setLocalValue] = useState<ModMetadata[] | undefined>(
  //   value,
  // );
  // const localValueRef = useValueRef(localValue);

  // const onChangeLocal = useCallback<ModPickerProps['onChange']>(() => {

  // }, [])

  const [inputValue, setInputValue] = useState("");
  const [searchString, setSearchString] = useState("");

  const [fetchOptions, options = emptyOptions, status, reset] = useApiRequest(searchMods, true);

  const debouncedSearch = useMemo(() => debounce(setSearchString, 500, { trailing: true }), []);
  useEffect(() => {
    if (inputValue.trim()) {
      debouncedSearch(inputValue.trim());
    }
  }, [debouncedSearch, inputValue]);

  useEffect(() => {
    if (searchString) {
      fetchOptions(searchString);
    } else {
      reset(true);
    }
  }, [searchString]);

  return (
    <Autocomplete<ModMetadata, true, true, false>
      {...props}
      multiple
      inputValue={inputValue}
      onInputChange={(_, newValue) => setInputValue(newValue)}
      filterSelectedOptions
      filterOptions={ident}
      getOptionLabel={option => option.name}
      renderValue={() => ""}
      getOptionKey={option => option.slug}
      isOptionEqualToValue={(opt, value) => opt.slug === value.slug}
      options={status.success || status.pending ? options : emptyOptions}
      renderOption={renderOption}
      disableClearable
      noOptionsText={
        status.success ? "No matches for your search" : "Start typing to search mods..."
      }
      renderInput={params => (
        <TextField {...params} label="Search for a mod..." value={inputValue} />
      )}
      onChange={(...args) => {
        setInputValue("");
        setSearchString("");
        if (args[2] === "removeOption") {
          return;
        }
        props.onChange?.(...args);
      }}
      slotProps={{
        listbox: {
          component: VirtualizedListbox,
          // @ts-expect-error custom prop
          renderRow: renderVisualOption,
          size: 48,
        },
      }}
    />
  );
}
