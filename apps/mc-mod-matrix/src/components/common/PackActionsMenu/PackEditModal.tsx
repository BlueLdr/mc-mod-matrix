"use client";

import { useContext, useEffect } from "react";

import { Modal, PACK_FORM_DEFAULT_DATA, PackForm } from "~/components";
import { PackActionsModalsContext, StorageContext } from "~/context";
import { useModalTarget, useStateObject } from "~/utils";

import Button from "@mui/material/Button";

import type { StoredModpack } from "@mcmm/data";

//================================================

const EDIT_PACK_FORM_ID = "edit-pack-form";

export function PackEditModal() {
  const { editTarget, setEditTarget } = useContext(PackActionsModalsContext);
  const [open, pack, TransitionProps] = useModalTarget(editTarget);

  const { updatePack } = useContext(StorageContext);

  const [formData, setFormData] = useStateObject<StoredModpack>({
    ...PACK_FORM_DEFAULT_DATA,
    id: "",
  });

  const allowSubmit =
    !!formData.name &&
    !!formData.versions.min &&
    !!formData.versions.max &&
    !!formData.loaders.length;
  useEffect(() => {
    if (pack?.id) {
      setFormData(pack);
    }
  }, [pack?.id]);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!allowSubmit || !pack) {
      return;
    }
    updatePack({ ...pack, ...formData });
    setEditTarget(undefined);
  };

  return (
    <Modal
      id="edit-pack-modal"
      open={open}
      onClose={() => {
        setEditTarget(undefined);
      }}
      titleText={`Edit "${pack?.name}" details`}
      slotProps={{
        transition: TransitionProps,
      }}
      confirmButton={
        <Button disabled={!allowSubmit} type="submit" form={EDIT_PACK_FORM_ID}>
          Save
        </Button>
      }
      cancelButton={<Button>Cancel</Button>}
    >
      <form id={EDIT_PACK_FORM_ID} onSubmit={onSubmit}>
        <PackForm formData={formData} setFormData={setFormData} hideVersionFields />
      </form>
    </Modal>
  );
}
