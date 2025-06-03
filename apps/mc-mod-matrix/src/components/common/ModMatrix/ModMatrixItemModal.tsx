"use client";

import { capitalize } from "lodash";

import { Modal, ModpackSupportIssuesList } from "~/components";
import { useModalTarget } from "~/utils";

import type { PackSupportMeta } from "@mcmm/data";

//================================================

export type ModMatrixItemModalProps = {
  packSupportMeta?: PackSupportMeta;
  closeModal: () => void;
  separateAltModsList?: boolean;
};

export function ModMatrixItemModal({
  packSupportMeta: target,
  closeModal,
  separateAltModsList,
}: ModMatrixItemModalProps) {
  const [open, packSupportMeta, TransitionProps] = useModalTarget(target);

  return (
    <Modal
      id={`pack-support-modal-${packSupportMeta?.pack.name}`}
      open={open}
      onClose={closeModal}
      titleText={`${capitalize(packSupportMeta?.loader)} ${packSupportMeta?.gameVersion}`}
      slotProps={{
        transition: TransitionProps,
        paper: {
          sx: {
            minWidth: "420px",
            "& .mcmm-SupportIssuesList__allSupported": {
              height: "12rem",
            },
          },
        },
      }}
    >
      {packSupportMeta && (
        <ModpackSupportIssuesList
          packSupportMeta={packSupportMeta}
          separateAltModsList={separateAltModsList}
        />
      )}
    </Modal>
  );
}
