"use client";

/** MOSTLY COPIED FROM https://mui.com/material-ui/react-autocomplete/#virtualization */

import { VariableSizeList } from "react-window";
import { createContext, forwardRef, useContext, useEffect, useRef } from "react";
import { useTheme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";

import MenuItem from "@mui/material/MenuItem";

import type { ListChildComponentProps } from "react-window";

//================================================

const LISTBOX_PADDING = 8; // px

function defaultRenderRow(props: ListChildComponentProps) {
  const { data, index, style } = props;
  const dataSet = data[index];
  const [rowProps, id, state] = dataSet;
  const inlineStyle = {
    ...style,
    top: (style.top as number) + LISTBOX_PADDING,
  };
  return (
    <MenuItem
      {...rowProps}
      key={id}
      id={`${id}`}
      value={id}
      selected={state.selected}
      style={inlineStyle}
    >
      {id}
    </MenuItem>
  );
}

const OuterElementContext = createContext({});

const OuterElementType = forwardRef<HTMLDivElement>((props, ref) => {
  const outerProps = useContext(OuterElementContext);
  return <div ref={ref} {...props} {...outerProps} />;
});
OuterElementType.displayName = "OuterElementType";

function useResetCache(data: any) {
  const ref = useRef<VariableSizeList>(null);
  useEffect(() => {
    if (ref.current != null) {
      ref.current.resetAfterIndex(0, true);
    }
  }, [data]);
  return ref;
}

// Adapter for react-window
function VirtualizedListboxComponent(
  props: React.HTMLAttributes<HTMLElement> & {
    size?: number;
    renderRow: <T>(props: ListChildComponentProps<T>) => React.ReactNode;
  },
  ref: React.ForwardedRef<HTMLDivElement>,
) {
  const { children, renderRow = defaultRenderRow, size, ...other } = props;
  const itemData: React.ReactElement[] = [];
  (children as React.ReactElement[]).forEach(
    (item: React.ReactElement & { children?: React.ReactElement[] }) => {
      itemData.push(item);
      itemData.push(...(item.children || []));
    },
  );

  const theme = useTheme();
  const smUp = useMediaQuery(theme.breakpoints.up("sm"), {
    noSsr: true,
  });
  const itemCount = itemData.length;
  const itemSize = size ?? (smUp ? 48 : 36);

  const getChildSize = (child: React.ReactElement) => {
    if (size) {
      return size;
    }
    // eslint-disable-next-line no-prototype-builtins
    if (child.hasOwnProperty("group")) {
      return 48;
    }

    return itemSize;
  };

  const getHeight = () => {
    if (itemCount > 8) {
      return 8 * itemSize;
    }
    return itemData.map(getChildSize).reduce((a, b) => a + b, 0);
  };

  const gridRef = useResetCache(itemCount);

  return (
    <div ref={ref}>
      <OuterElementContext.Provider value={other}>
        <VariableSizeList
          itemData={itemData}
          height={getHeight() + 2 * LISTBOX_PADDING}
          width="100%"
          ref={gridRef}
          outerElementType={OuterElementType}
          innerElementType="ul"
          itemSize={index => getChildSize(itemData[index])}
          overscanCount={5}
          itemCount={itemCount}
        >
          {renderRow}
        </VariableSizeList>
      </OuterElementContext.Provider>
    </div>
  );
}

export const VirtualizedListbox = forwardRef(VirtualizedListboxComponent);
/*

export const makeVirtualizedListboxWithRenderFunction = <T = any>(
  renderRow: (props: ListChildComponentProps<T>) => React.ReactNode,
) =>
  forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLElement> & { size?: number }
  >(function VirtualizedListbox(props, ref) {
    return VirtualizedListboxComponent({ ...props, renderRow }, ref);
  });
*/
