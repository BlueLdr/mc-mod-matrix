"use client";

import { createContext, useState } from "react";

import type { ValueAndSetter, WithChildren } from "@mcmm/types";

//================================================

export type ModpackDetailPageState = ValueAndSetter<"isSingleColumn", boolean | undefined>;

export const ModpackDetailPageContext = createContext<ModpackDetailPageState>({
  isSingleColumn: undefined,
  setIsSingleColumn: () => undefined,
});

export const ModpackDetailPageProvider = ({ children }: WithChildren) => {
  const [isSingleColumn, setIsSingleColumn] = useState<boolean>();

  return (
    <ModpackDetailPageContext value={{ isSingleColumn, setIsSingleColumn }}>
      {children}
    </ModpackDetailPageContext>
  );
};
