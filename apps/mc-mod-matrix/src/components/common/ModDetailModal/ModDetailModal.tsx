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

  const { dataRegistry } = useContext(DataRegistryContext);

  const minVersion = useMinVersion(mod);
  const onSave = useCallback(
    (platform: Platform, meta: PlatformModMetadata | undefined) => {
      if (!mod || !minVersion || !dataRegistry) {
        return Promise.reject();
      }
      if (!meta) {
        return dataRegistry?.helper.removePlatformFromMod(mod.id, platform) ?? Promise.reject();
      } else {
        const newMeta = {
          ...mod,
          platforms: new PlatformModMetadataCollection(...mod.platforms),
        };
        newMeta.platforms.set(meta);
        return dataRegistry.storeMod(newMeta, minVersion);
      }
    },
    [mod, minVersion, dataRegistry],
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
            meta={mod?.platforms.get(platform)}
            platform={platform}
            key={platform}
            onSave={onSave}
            allowRemove={(mod?.platforms.length ?? 0) > 1}
          />
        ))}
      </Grid>

      <ModDetailAlternativesSection handleRef={alternativesHandleRef} mod={mod} />
    </Modal>
  );
}
