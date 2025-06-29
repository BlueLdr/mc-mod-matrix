"use client";

import { values } from "lodash";
import { useCallback, useContext, useRef } from "react";

import { Platform, PlatformModMetadataCollection } from "@mcmm/data";
import { useAllModsMap, useMinVersion } from "~/data-utils";
import { useModalTarget } from "~/utils";
import { DataRegistryContext, ModDetailModalContext } from "~/context";
import { Modal } from "~/components";

import { ModDetailRootMetaPicker } from "./ModDetailRootMetaPicker";
import { ModDetailAlternativesSection } from "./ModDetailAlternativesSection";
import { ModDetailPlatformItem } from "./ModDetailPlatformItem";

import Grid from "@mui/material/Grid";

import type { PlatformModMetadata } from "@mcmm/data";
import type { ModDetailAlternativesSectionHandle } from "./ModDetailAlternativesSection";

//================================================

export function ModDetailModal() {
  const { modDetailTarget, setModDetailTarget } = useContext(ModDetailModalContext);
  const allMods = useAllModsMap();
  const target = modDetailTarget ? allMods?.get(modDetailTarget) : undefined;

  const [open, mod, TransitionProps] = useModalTarget(target);

  const alternativesHandleRef = useRef<ModDetailAlternativesSectionHandle | null>(null);

  const { storeMod, dataRegistry } = useContext(DataRegistryContext);

  const minVersion = useMinVersion(mod, dataRegistry);
  const onSave = useCallback(
    (platform: Platform, meta: PlatformModMetadata | undefined) => {
      if (!mod || !minVersion) {
        return Promise.reject();
      }
      if (!meta) {
        return dataRegistry.removePlatformFromMod(mod.id, platform);
      } else {
        const newMeta = {
          ...mod.meta,
          platforms: new PlatformModMetadataCollection(...mod.meta.platforms),
        };
        newMeta.platforms.set(meta);
        return storeMod(newMeta, minVersion);
      }
    },
    [mod, minVersion, dataRegistry, storeMod],
  );

  return (
    <Modal
      id={mod?.id ?? "modDetailModal"}
      open={open}
      onClose={() => setModDetailTarget(undefined)}
      titleText={
        <Grid container spacing={2} alignItems="center">
          <ModDetailRootMetaPicker mod={mod} property="image" />
          <ModDetailRootMetaPicker mod={mod} property="name" />
        </Grid>
      }
      slotProps={{
        transition: TransitionProps,
      }}
    >
      <Grid
        container
        sx={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gridAutoRows: "1fr",
          gap: theme => theme.spacing(1),
        }}
      >
        {values(Platform).map(platform => (
          <ModDetailPlatformItem
            meta={mod?.meta.platforms.get(platform)}
            platform={platform}
            key={platform}
            onSave={onSave}
          />
        ))}
      </Grid>

      <ModDetailAlternativesSection handleRef={alternativesHandleRef} mod={mod} />
    </Modal>
  );
}
