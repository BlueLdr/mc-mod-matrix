"use client";

import { Fragment, useContext, useEffect, useState } from "react";

import { Icon, Modal, ModListItem, ModPicker } from "~/components";
import { DataRegistryContext } from "~/context";
import { useModalTarget } from "~/utils";

import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import Divider from "@mui/material/Divider";
import Grid from "@mui/material/Grid";
import List from "@mui/material/List";

import type { GameVersion, Mod, ModMetadata } from "@mcmm/data";

//================================================

export type ModAlternativeModalProps = {
  mod: Mod | undefined;
  closeModal: () => void;
  onSave: (mod: Mod, alternatives: ModMetadata[]) => void;
  minVersion: GameVersion;
};

export function ModAlternativeModal({
  mod: target,
  minVersion,
  closeModal,
  onSave,
}: ModAlternativeModalProps) {
  const { storeMod } = useContext(DataRegistryContext);
  const [alternatives, setAlternatives] = useState(target?.alternatives ?? []);

  const [loadingMod, setLoadingMod] = useState<ModMetadata>();

  const [open, mod, TransitionProps] = useModalTarget(target);
  useEffect(() => {
    setAlternatives(mod?.alternatives ?? []);
  }, [mod]);

  return (
    <Modal
      id={`mod-alternatives-modal-${mod?.meta.slug}`}
      open={open}
      onClose={closeModal}
      maxWidth="sm"
      fullWidth
      slotProps={{
        transition: TransitionProps,
      }}
      confirmButton={
        <Button
          onClick={
            mod
              ? () => {
                  onSave(mod, alternatives);
                  closeModal();
                }
              : undefined
          }
        >
          Save
        </Button>
      }
      cancelButton={<Button>Cancel</Button>}
      titleText={
        mod && (
          <Grid container spacing={4} alignItems="center">
            <Icon size={32} src={mod.meta.image || undefined} />
            {mod.name}
          </Grid>
        )
      }
    >
      {mod && (
        <Grid py={4}>
          <ModPicker
            size="small"
            value={alternatives}
            onChange={(_, newValue, __, details) => {
              if (details?.option) {
                setLoadingMod(details.option);
                storeMod(details.option, minVersion).then(mod => {
                  if (mod) {
                    setAlternatives(newValue);
                    setLoadingMod(undefined);
                  }
                });
              }
            }}
          />
          <Card variant="outlined" sx={{ paddingInline: 4, marginBlock: 4 }}>
            <List>
              {alternatives.map((item, index) => (
                <Fragment key={item.slug}>
                  {index > 0 && <Divider />}
                  <ModListItem
                    key={item.slug}
                    mod={item}
                    showPlatforms="link"
                    sx={{
                      "&:not(:hover) .mcmm-ModListItem__alternatives--empty": {
                        display: "none",
                      },
                    }}
                    onRemove={mod => setAlternatives(list => list.filter(m => m.slug !== mod.slug))}
                  />
                </Fragment>
              ))}
              {loadingMod && (
                <>
                  {alternatives.length > 0 && <Divider />}
                  <ModListItem mod={loadingMod} showPlatforms loading />
                </>
              )}
            </List>
          </Card>
        </Grid>
      )}
    </Modal>
  );
}
