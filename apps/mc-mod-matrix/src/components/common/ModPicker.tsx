"use client";

import { getUniqueIdForModMetadata } from "@mcmm/data";
import { useModSearch } from "~/data-utils";

import { ModListItem } from "./ModListItem";
import { VirtualizedListbox } from "./VirtualizedListBox";

import Autocomplete from "@mui/material/Autocomplete";
import MenuItem from "@mui/material/MenuItem";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";

import type { ModMetadata } from "@mcmm/data";
import type { ListChildComponentProps } from "react-window";
import type { AutocompleteProps, AutocompleteRenderOptionState } from "@mui/material/Autocomplete";
import type { DistributiveOmit } from "@mcmm/types";

// ================================================================

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
      key={getUniqueIdForModMetadata(metadata)}
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

  const [inputValue, setInputValue, options, status, resetSearch] = useModSearch();

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
      getOptionKey={option => getUniqueIdForModMetadata(option)}
      isOptionEqualToValue={(opt, value) =>
        opt.platforms.every(meta => meta.id === value.platforms.get(meta.platform)?.id)
      }
      options={status.success || status.pending ? (options ?? emptyOptions) : emptyOptions}
      renderOption={renderOption}
      getOptionDisabled={() => status.pending}
      disableClearable
      loading={status.pending}
      noOptionsText={
        status.success ? (
          "No matches for your search"
        ) : status.error ? (
          <Typography color="error">
            <b>Error:</b> {status.error.message}
          </Typography>
        ) : (
          "Start typing to search mods..."
        )
      }
      renderInput={params => (
        <TextField {...params} label="Search for a mod..." value={inputValue} />
      )}
      onChange={(...args) => {
        resetSearch();
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
