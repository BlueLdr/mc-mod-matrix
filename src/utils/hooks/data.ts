import { useCallback, useRef, useState } from "react";

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
