"use client";

import { values } from "lodash";
import { useCallback, useContext, useRef } from "react";

import { Platform, PlatformModMetadataCollection } from "@mcmm/data";
import { useAllModsMap, useMinVersion } from "~/data-utils";
import { MOD_DETAIL_MODAL_SEARCH_PARAM, useSearchParamRoutedModal } from "~/utils";
import { DataRegistryContext } from "~/context";
import { Modal } from "~/components";

import { ModDetailRootMetaPicker } from "./ModDetailRootMetaPicker";
import { ModDetailAlternativesSection } from "./ModDetailAlternativesSection";
import { ModDetailPlatformItem } from "./ModDetailPlatformItem";

import Grid from "@mui/material/Grid";

import type { PlatformModMetadata } from "@mcmm/data";
import type { ModDetailAlternativesSectionHandle } from "./ModDetailAlternativesSection";

//================================================

export function ModDetailModal() {
  const allMods = useAllModsMap();

  const [, mod, modalProps] = useSearchParamRoutedModal(
    MOD_DETAIL_MODAL_SEARCH_PARAM,
    id => allMods?.get(id),
    true,
  );

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
      {...modalProps}
      titleText={
        <Grid container spacing={2} alignItems="center">
          <ModDetailRootMetaPicker mod={mod} property="image" />
          <ModDetailRootMetaPicker mod={mod} property="name" />
        </Grid>
      }
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
