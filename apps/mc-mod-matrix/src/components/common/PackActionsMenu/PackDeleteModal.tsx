"use client";

import { usePathname, useRouter } from "next/navigation";
import { useContext } from "react";

import { Modal } from "~/components";
import { PackActionsModalsContext, StorageContext } from "~/context";
import { useModalTarget } from "~/utils";

import Button from "@mui/material/Button";

//================================================

export function PackDeleteModal() {
  const { deleteTarget, setDeleteTarget } = useContext(PackActionsModalsContext);
  const { removePack } = useContext(StorageContext);
  const path = usePathname();
  const router = useRouter();

  const [open, pack, TransitionProps] = useModalTarget(deleteTarget);

  return (
    <Modal
      id="delete-pack-modal"
      open={open}
      onClose={() => setDeleteTarget(undefined)}
      titleText="Delete modpack"
      slotProps={{
        transition: TransitionProps,
      }}
      maxWidth="xs"
      confirmButton={
        <Button
          color="error"
          disabled={!pack}
          onClick={
            pack
              ? () => {
                  removePack(pack.id);
                  setDeleteTarget(undefined);
                  if (path.endsWith(pack.id)) {
                    router.replace("/");
                  }
                }
              : undefined
          }
        >
          Delete
        </Button>
      }
      cancelButton={<Button>Cancel</Button>}
    >
      Are you sure you want to delete the modpack &quot;{pack?.name}&quot;? This action cannot be
      undone.
    </Modal>
  );
}
