"use client";

import { cloneDeep } from "lodash";
import { useContext, useEffect } from "react";

import { validateGameVersionRange } from "@mcmm/utils";
import { Modal, PACK_FORM_DEFAULT_DATA, PackForm } from "~/components";
import { PackActionsModalsContext, StorageContext } from "~/context";
import { useModalTarget, useStateObject } from "~/utils";

import Button from "@mui/material/Button";

import type { StoredModpack } from "@mcmm/data";

//================================================

const DUPLICATE_PACK_FORM_ID = "duplicate-pack-form";

export function PackDuplicateModal() {
  const { duplicateTarget, setDuplicateTarget } = useContext(PackActionsModalsContext);
  const [open, pack, TransitionProps] = useModalTarget(duplicateTarget);

  const { addPack } = useContext(StorageContext);

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
      const { id, ...packData } = pack;
      setFormData(cloneDeep({ ...packData, name: `${packData.name} (Copy)` }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pack]);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!allowSubmit || !pack) {
      return;
    }
    validateGameVersionRange(formData.versions);
    addPack(formData);
    setDuplicateTarget(undefined);
  };

  return (
    <Modal
      id="duplicate-pack-modal"
      open={open}
      onClose={() => {
        setDuplicateTarget(undefined);
      }}
      titleText={`Duplicate pack "${pack?.name}"`}
      slotProps={{
        transition: TransitionProps,
      }}
      confirmButton={
        <Button disabled={!allowSubmit} type="submit" form={DUPLICATE_PACK_FORM_ID}>
          Create
        </Button>
      }
      cancelButton={<Button>Cancel</Button>}
    >
      <form id={DUPLICATE_PACK_FORM_ID} onSubmit={onSubmit}>
        <PackForm formData={formData} setFormData={setFormData} />
      </form>
    </Modal>
  );
}
