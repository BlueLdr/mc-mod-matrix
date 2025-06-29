"use client";

import { createContext, useMemo, useState } from "react";

import type { WithChildren, WithStateHook } from "@mcmm/types";

//================================================

export const ModDetailModalContext = createContext<
  WithStateHook<"modDetailTarget", string | undefined>
>({
  modDetailTarget: undefined,
  setModDetailTarget: () => undefined,
});

export function ModDetailModalProvider({ children }: WithChildren) {
  const [modDetailTarget, setModDetailTarget] = useState<string>();

  return (
    <ModDetailModalContext
      value={useMemo(() => ({ modDetailTarget, setModDetailTarget }), [modDetailTarget])}
    >
      {children}
    </ModDetailModalContext>
  );
}
