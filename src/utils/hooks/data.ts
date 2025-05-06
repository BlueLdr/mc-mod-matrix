import {
  type Dispatch,
  type SetStateAction,
  useCallback,
  useRef,
  useState,
} from "react";
import { loadStorage, setStorage } from "~/utils";

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

interface UseStorageState {
  <T>(
    key: string,
    initialState: T | (() => T),
  ): [T, Dispatch<SetStateAction<T>>];

  <T = undefined>(
    key: string,
  ): [T | undefined, Dispatch<SetStateAction<T | undefined>>];
}

export const useStorageState: UseStorageState = <T>(
  key: string,
  initialValue?: T | (() => T),
) => {
  const [value, _setValue] = useState(() =>
    loadStorage(
      key,
      typeof initialValue === "function"
        ? (initialValue as () => T)()
        : initialValue,
    ),
  );

  const setValue = useCallback<Dispatch<SetStateAction<T>>>(newState => {
    _setValue(oldState => {
      const newValue =
        typeof newState === "function"
          ? (newState as (state: T | undefined) => T | undefined)(oldState)
          : newState;
      setStorage(key, newValue);
      return loadStorage<T>(key);
    });
  }, []);

  return [value, setValue] as const;
};
