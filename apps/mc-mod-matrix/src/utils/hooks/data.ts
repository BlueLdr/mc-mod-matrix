"use client";

import { useCallback, useRef, useState } from "react";

import { loadStorage, setStorage } from "~/utils";

import type { Dispatch, SetStateAction } from "react";

//================================================

export const useValueRef = <T>(value: T) => {
  const value_ref = useRef<T>(value);
  value_ref.current = value;
  return value_ref;
};

export interface StateObjectSetAction<T extends object> {
  (value: Partial<T>): void;

  (cb: (prevState: T) => T): void;
}

export const useStateObject = <T extends object>(initialState: T) => {
  const [state, setAllState] = useState(initialState);
  const setState = useCallback<StateObjectSetAction<T>>(newState => {
    if (typeof newState === "function") {
      return setAllState(newState);
    }
    setAllState(prevState => ({ ...prevState, ...newState }));
  }, []);
  return [state, setState] as const;
};

export interface UseStorageStateTransformer<T, S> {
  to: (value: S) => T;
  from: (value: T) => S;
}

interface UseStorageState {
  <T, S = T>(
    key: string,
    initialState: T | (() => T),
    transform?: UseStorageStateTransformer<T, S>,
  ): [S, Dispatch<SetStateAction<S>>];

  <T = undefined, S = T>(
    key: string,
    transform?: UseStorageStateTransformer<T, S>,
  ): [S | undefined, Dispatch<SetStateAction<S | undefined>>];
}

export const useStorageState: UseStorageState = <T, S = T>(
  key: string,
  initialValue?: T | (() => T),
  transform?: UseStorageStateTransformer<T, S>,
) => {
  const [value, _setValue] = useState<S | undefined>(() => {
    const rawValue = loadStorage(
      key,
      typeof initialValue === "function" ? (initialValue as () => T)() : initialValue,
    );
    return transform && rawValue !== undefined
      ? transform.from(rawValue)
      : (rawValue as S | undefined);
  });

  const setValue = useCallback<Dispatch<SetStateAction<S>>>(
    newState => {
      _setValue(oldState => {
        const newValue =
          typeof newState === "function"
            ? (newState as (state: S | undefined) => S | undefined)(oldState)
            : newState;
        setStorage(
          key,
          newValue && transform ? transform.to(newValue) : (newValue as T | undefined),
        );
        const updatedValue = loadStorage<T>(key);
        return updatedValue !== undefined && transform
          ? transform.from(updatedValue)
          : (updatedValue as S | undefined);
      });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [key, transform?.to],
  );

  return [value, setValue] as const;
};
