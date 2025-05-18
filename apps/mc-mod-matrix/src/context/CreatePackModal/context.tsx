"use client";

import { createContext, useMemo, useState } from "react";

import type { ValueAndSetter, WithChildren } from "~/utils";

//================================================

export const CreatePackModalContext = createContext<ValueAndSetter<"open", boolean>>({
  open: false,
  setOpen: () => {},
});

export const CreatePackModalProvider = ({ children }: WithChildren) => {
  const [open, setOpen] = useState(false);
  const value = useMemo(() => ({ open, setOpen }), [open]);

  return (
    <CreatePackModalContext.Provider value={value}>{children}</CreatePackModalContext.Provider>
  );
};
