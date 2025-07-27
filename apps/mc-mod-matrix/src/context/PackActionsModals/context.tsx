"use client";

import { createContext, useMemo, useState } from "react";

import type { StoredModpack } from "@mcmm/data";
import type { ValueAndSetter, WithChildren } from "@mcmm/types";

//================================================

export type PackActionsModalsState = ValueAndSetter<"createModalOpen", boolean> &
  ValueAndSetter<"editTarget", StoredModpack | undefined> &
  ValueAndSetter<"deleteTarget", StoredModpack | undefined> &
  ValueAndSetter<"duplicateTarget", StoredModpack | undefined>;

export const PackActionsModalsContext = createContext<PackActionsModalsState>({
  createModalOpen: false,
  setCreateModalOpen: () => {},
  editTarget: undefined,
  setEditTarget: () => {},
  duplicateTarget: undefined,
  setDuplicateTarget: () => {},
  deleteTarget: undefined,
  setDeleteTarget: () => {},
});

export const CreatePackModalProvider = ({ children }: WithChildren) => {
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<StoredModpack>();
  const [duplicateTarget, setDuplicateTarget] = useState<StoredModpack>();
  const [deleteTarget, setDeleteTarget] = useState<StoredModpack>();
  const value = useMemo(
    () => ({
      createModalOpen,
      setCreateModalOpen,
      editTarget,
      setEditTarget,
      duplicateTarget,
      setDuplicateTarget,
      deleteTarget,
      setDeleteTarget,
    }),
    [createModalOpen, editTarget, duplicateTarget, deleteTarget],
  );

  return (
    <PackActionsModalsContext.Provider value={value}>{children}</PackActionsModalsContext.Provider>
  );
};
