import { useEffect, useMemo, useState } from "react";

import { useValueRef } from "~/utils";

//================================================

export const useOptionsFromSelection = <
  T extends Partial<Record<Id, any>>,
  K extends string,
  S extends Partial<Record<K, T[] | null>>,
  Id extends string = "id"
>(
  parentSelection: S[] | undefined,
  parentOptions: S[] | undefined,
  prop: K,
  // @ts-expect-error: ts can't take a hint
  idProp: Id = "id" as const
): T[] =>
  useMemo(() => {
    const items = parentSelection?.length ? parentSelection : parentOptions;
    if (!items?.length) {
      return [];
    }

    const idsFound = new Set();
    const options: T[] = [];
    items.forEach(item => {
      item[prop]?.forEach(option => {
        if (!idsFound.has(option[idProp])) {
          idsFound.add(option[idProp]);
          options.push(option);
        }
      });
    });

    return options;
  }, [parentSelection, parentOptions, prop, idProp]);

export const useDateFromSearchParams = (
  searchParamValue: string | null
): [Date | null, React.Dispatch<React.SetStateAction<Date | null>>] => {
  const initialValue = useMemo(() => {
    if (!searchParamValue) {
      return null;
    }
    const date = new Date(parseInt(searchParamValue));
    return isNaN(date.getTime()) ? null : date;
  }, [searchParamValue]);
  const [value, setValue] = useState<Date | null>(initialValue);
  const valueRef = useValueRef(value);
  useEffect(() => {
    if (initialValue?.getTime() !== valueRef.current?.getTime()) {
      setValue(initialValue);
    }
  }, [initialValue, valueRef]);

  return [value, setValue];
};
