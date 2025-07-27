"use client";

import { useContext, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

import { validateGameVersionRange } from "@mcmm/utils";
import { useStateObject } from "~/utils";
import { PackActionsModalsContext, StorageContext } from "~/context";
import { Modal, PACK_FORM_DEFAULT_DATA, PackForm } from "~/components";

import Checkbox from "@mui/material/Checkbox";
import FormControlLabel from "@mui/material/FormControlLabel";
import Button from "@mui/material/Button";
import Tooltip from "@mui/material/Tooltip";

//================================================

const CREATE_PACK_FORM_ID = "create-pack-form";

const defaultFormData = { ...PACK_FORM_DEFAULT_DATA };

export function CreatePackModal() {
  const router = useRouter();
  const { createModalOpen: open, setCreateModalOpen: setOpen } =
    useContext(PackActionsModalsContext);
  const checkboxRef = useRef<HTMLButtonElement>(null);

  const { commonMods, addPack } = useContext(StorageContext);
  defaultFormData.includeCommonMods = !!commonMods.length;

  const [formData, setFormData] = useStateObject(defaultFormData);

  const allowSubmit =
    !!formData.name &&
    !!formData.versions.min &&
    !!formData.versions.max &&
    !!formData.loaders.length;

  useEffect(() => {
    if (open) {
      setFormData(defaultFormData);
    }
  }, [open, setFormData]);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!allowSubmit) {
      return;
    }
    const { includeCommonMods, ...packData } = formData;
    if (includeCommonMods && commonMods.length) {
      packData.mods = commonMods;
    }
    validateGameVersionRange(packData.versions);
    const newId = addPack(packData);
    router.push(`/${encodeURIComponent(newId)}`);
    setOpen(false);
  };

  return (
    <Modal
      id="create-pack-modal"
      open={open}
      onClose={() => {
        setOpen(false);
        setFormData(defaultFormData);
      }}
      titleText="Create New Modpack"
      confirmButton={
        <Button disabled={!allowSubmit} type="submit" form={CREATE_PACK_FORM_ID}>
          Create
        </Button>
      }
      cancelButton={<Button>Cancel</Button>}
    >
      <form id={CREATE_PACK_FORM_ID} onSubmit={onSubmit}>
        <PackForm formData={formData} setFormData={setFormData}>
          <Tooltip
            title={
              commonMods.length
                ? undefined
                : `To use this feature, you first need to add some mods to your Common Mods list. Click "Manage data" in the sidebar to expand the menu, then click "Common mods".`
            }
            enterDelay={0}
            slotProps={{
              popper: {
                anchorEl: checkboxRef.current,
                placement: "top-start",
                modifiers: [
                  {
                    name: "offset",
                    options: {
                      offset: [0, -14],
                    },
                  },
                ],
              },
            }}
          >
            <FormControlLabel
              disabled={!commonMods.length}
              control={
                <Checkbox
                  ref={checkboxRef}
                  indeterminate={!commonMods.length}
                  checked={!commonMods.length || formData.includeCommonMods}
                  onChange={
                    !commonMods.length
                      ? undefined
                      : e => setFormData({ includeCommonMods: e.target.checked })
                  }
                />
              }
              label="Add your Common Mods to the new modpack automatically"
              slotProps={{
                typography: { variant: "caption" },
              }}
            />
          </Tooltip>
        </PackForm>
      </form>
    </Modal>
  );
}
