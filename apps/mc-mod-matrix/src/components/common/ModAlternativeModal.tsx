"use client";

import { Fragment, useContext, useEffect, useMemo, useState } from "react";

import { getUniqueIdForModMetadata } from "@mcmm/data";
import { Icon, Modal, ModListItem, ModPicker } from "~/components";
import { DataRegistryContext } from "~/context";
import { useAllModsMap } from "~/data-utils";
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
  onSave: (mod: Mod, alternatives: string[]) => void;
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

  const { dataRegistry } = useContext(DataRegistryContext);
  const allMods = useAllModsMap();

  const [open, mod, TransitionProps] = useModalTarget(target);
  useEffect(() => {
    setAlternatives(mod?.alternatives ?? []);
  }, [mod]);

  const value = useMemo(
    () => alternatives.map(id => allMods?.get(id)?.meta).filter(item => !!item),
    [allMods, alternatives],
  );

  return (
    <Modal
      id={`mod-alternatives-modal-${mod?.id}`}
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
            value={value}
            onChange={async (_, newValue, __, details) => {
              if (details?.option) {
                if (!newValue.includes(details.option)) {
                  const removedMod = await dataRegistry.getModByMeta(details.option);
                  setAlternatives(prevValue => prevValue.filter(id => id !== removedMod?.modId));
                  return;
                }
                setLoadingMod(details.option);
                storeMod(details.option, minVersion).then(mod => {
                  if (mod) {
                    setAlternatives(prevValue => [...prevValue, mod.id]);
                    setLoadingMod(undefined);
                  }
                });
              }
            }}
          />
          <Card variant="outlined" sx={{ paddingInline: 4, marginBlock: 4 }}>
            <List>
              {value.map((item, index) => {
                const metaId = getUniqueIdForModMetadata(item);
                return (
                  <Fragment key={metaId}>
                    {index > 0 && <Divider />}
                    <ModListItem
                      key={metaId}
                      mod={item}
                      showPlatforms="link"
                      sx={{
                        "&:not(:hover) .mcmm-ModListItem__alternatives--empty": {
                          display: "none",
                        },
                      }}
                      onRemove={async modMeta => {
                        const mod = await dataRegistry.getModByMeta(modMeta);
                        setAlternatives(list => list.filter(id => id !== mod?.modId));
                      }}
                    />
                  </Fragment>
                );
              })}
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
