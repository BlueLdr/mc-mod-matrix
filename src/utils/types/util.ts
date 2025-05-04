export type ValuesOf<T extends object> = {
  [K in keyof T]: T[K];
}[keyof T];

export type EntryOf<T> = { [K in keyof T]: [K, T[K]] }[keyof T];

export type PropsOfType<T extends object, U> = {
  [K in keyof T]: T[K] extends U ? K : never;
}[keyof T];

export type StringPropOf<T extends object> = PropsOfType<T, string>;

export type WithStateHook<Name extends string, T> = Record<Name, T> &
  Record<`set${Capitalize<Name>}`, React.Dispatch<React.SetStateAction<T>>>;

export type ValueAndSetter<Name extends string, T> = Record<Name, T> &
  Record<`set${Capitalize<Name>}`, (value: T) => void>;
