"use client";

import { capitalize } from "lodash";
import { useContext } from "react";

import { Modal, ModpackSupportIssuesList, Unpin } from "~/components";
import { StorageContext } from "~/context";
import { useCurrentPackWithData } from "~/data-utils";
import { useModalTarget } from "~/utils";

import IconButton from "@mui/material/IconButton";
import Grid from "@mui/material/Grid";
import Tooltip from "@mui/material/Tooltip";
import PushPin from "@mui/icons-material/PushPin";

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
  const { updatePack } = useContext(StorageContext);
  const currentPack = useCurrentPackWithData();
  const [open, packSupportMeta, TransitionProps] = useModalTarget(target);

  const isPinned =
    !!packSupportMeta &&
    !!currentPack?.pinnedVersions?.find(
      v => v.gameVersion === packSupportMeta.gameVersion && v.loader === packSupportMeta.loader,
    );

  const pinVersion = (item: PackSupportMeta) =>
    currentPack &&
    updatePack({
      ...currentPack,
      pinnedVersions: (currentPack?.pinnedVersions ?? []).concat([
        {
          loader: item.loader,
          gameVersion: item.gameVersion,
        },
      ]),
    });

  const unpinVersion = (item: PackSupportMeta) =>
    currentPack &&
    updatePack({
      ...currentPack,
      pinnedVersions: (currentPack.pinnedVersions ?? []).filter(
        v => v.gameVersion !== item.gameVersion || v.loader !== item.loader,
      ),
    });

  const Icon = isPinned ? Unpin : PushPin;

  return (
    <Modal
      id={`pack-support-modal-${packSupportMeta?.pack.name}`}
      open={open}
      onClose={closeModal}
      titleText={
        <Grid container alignItems="center" spacing={2}>
          <Grid>
            {capitalize(packSupportMeta?.loader)} {packSupportMeta?.gameVersion}
          </Grid>

          {packSupportMeta && (
            <Tooltip title={`${isPinned ? "Unp" : "P"}in this version`}>
              <IconButton onClick={() => (isPinned ? unpinVersion : pinVersion)(packSupportMeta)}>
                <Icon
                  sx={{
                    "&:not(:hover):not(:active)": {
                      color: theme => theme.palette.action.disabled,
                    },
                  }}
                />
              </IconButton>
            </Tooltip>
          )}
        </Grid>
      }
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
