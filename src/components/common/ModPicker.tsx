import {
  Grid,
  ListItemIcon,
  ListItemText,
  MenuItem,
  styled,
  TextField,
} from "@mui/material";
import type {
  AutocompleteProps,
  AutocompleteRenderOptionState,
} from "@mui/material/Autocomplete";
import Autocomplete from "@mui/material/Autocomplete";
import { debounce, uniq } from "lodash";
import { useCallback, useEffect, useMemo, useState } from "react";
import type { ListChildComponentProps } from "react-window";

import { curseforgeApi, modrinthApi, type ModMetadata } from "~/api";
import { useApiRequest, useValueRef, type DistributiveOmit } from "~/utils";
import { VirtualizedListbox } from "./VirtualizedListBox";
import { CurseforgeIcon, Icon, ModrinthIcon } from "./icons";

// ================================================================

const searchMods = async (text: string) => {
  const modrinthResults = await modrinthApi.searchMods(text);
  const curseforgeResults = await curseforgeApi.searchMods(text);

  const modrinthMap = new Map(modrinthResults.map(item => [item.slug, item]));
  const curseforgeMap = new Map(
    curseforgeResults.map(item => [item.slug, item]),
  );

  const modrinthSlugs = Array.from(modrinthMap.keys());
  const curseforgeSlugs = Array.from(curseforgeMap.keys());
  const uniqueSlugs = uniq([...modrinthSlugs, ...curseforgeSlugs]).sort(
    (a, b) => {
      const aIndex = modrinthMap.has(a)
        ? modrinthSlugs.indexOf(a)
        : curseforgeSlugs.indexOf(a);
      const bIndex = modrinthMap.has(b)
        ? modrinthSlugs.indexOf(b)
        : curseforgeSlugs.indexOf(b);
      return aIndex - bIndex;
    },
  );

  const unifiedResults: ModMetadata[] = [];
  for (const slug of uniqueSlugs) {
    const modrinthItem = modrinthMap.get(slug);
    const curseforgeItem = curseforgeMap.get(slug);
    unifiedResults.push({
      name: modrinthItem?.title ?? curseforgeItem!.name,
      slug: modrinthItem?.slug ?? curseforgeItem!.slug,
      image: modrinthItem?.icon_url ?? curseforgeItem!.thumbnailUrl,
      curseforge: curseforgeItem,
      modrinth: modrinthItem,
    });
  }

  return { data: unifiedResults };
};

const ident = <T extends any = any>(x: T) => x;

const renderOption = (
  props: React.HTMLAttributes<HTMLLIElement>,
  option: ModMetadata,
  state: AutocompleteRenderOptionState,
): React.ReactNode => [props, option, state] as any;

const renderVisualOption = (
  props: ListChildComponentProps<Parameters<typeof renderOption>[]>,
) => {
  const { data, index, style } = props;
  const dataSet = data[index];
  const [rowProps, metadata, state] = dataSet;
  const inlineStyle = {
    ...style,
    top: (style.top as number) + 8,
  };
  return (
    <MenuItem
      {...rowProps}
      key={metadata.slug}
      id={`${metadata.slug}`}
      value={metadata.slug}
      selected={state.selected}
      style={inlineStyle}
    >
      <ListItemIcon>
        <Icon size={48} src={metadata.image} />
      </ListItemIcon>
      <ListItemText>
        <Grid container spacing={4} alignItems="center">
          {metadata.name}
          {metadata.curseforge && <CurseforgeIcon />}
          {metadata.modrinth && <ModrinthIcon />}
        </Grid>
      </ListItemText>
    </MenuItem>
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

  const [fetchOptions, options = emptyOptions, status] = useApiRequest(
    searchMods,
    true,
  );

  const debouncedFetch = useMemo(
    () => debounce(fetchOptions, 500, { trailing: true }),
    [fetchOptions],
  );
  useEffect(() => {
    if (inputValue) {
      debouncedFetch(inputValue);
    }
    return debouncedFetch.cancel;
  }, [inputValue]);

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
      options={options}
      renderOption={renderOption}
      renderInput={params => <TextField {...params} value={inputValue} />}
      onChange={(...args) => {
        setInputValue("");
        props.onChange?.(...args);
      }}
      slotProps={{
        listbox: {
          component: VirtualizedListbox,
          // @ts-expect-error custom prop
          renderRow: renderVisualOption,
        },
      }}
    />
  );
}
