'use client';

import { createContext, useState } from "react";

import type { ValueAndSetter, WithChildren } from "@mcmm/types";

//================================================

export type ScrollNavState = ValueAndSetter<"currentAnchor", string | undefined>

export const ScrollNavContext = createContext<ScrollNavState>({
  currentAnchor: undefined,
  setCurrentAnchor: () => undefined
})

export const ScrollNavProvider = ({ children }: WithChildren) => {
  const [currentAnchor, setCurrentAnchor] = useState<string>();

  return <ScrollNavContext value={{ currentAnchor, setCurrentAnchor }}>{children}</ScrollNavContext>
}
