"use client";

import { styled } from "@mui/material/styles";
import { useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";

import { gameVersionComparator } from "@mcmm/utils";
import { ModpackDetailPageContext, ProgressIndicator } from "~/components";
import { DataRegistryContext } from "~/context";
import { DATA_REGISTRY_CACHE_LIFESPAN } from "~/data";
import { useDataRefreshProgress, useMounted, useResizeObserver } from "~/utils";

import { ModpackMatrixContent } from "./ModpackMatrixContent";
import { ModpackMatrixContentLoading } from "./ModpackMatrixContent.loading";

import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";

import type { ResizeObserverEntryCallback } from "~/utils";
import type { Modpack } from "@mcmm/data";

//================================================

const ProgressLabel = styled(Typography)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  gap: theme.spacing(3),
}));

//================================================

export type ModpackMatrixSectionProps = { pack: Modpack };

export function ModpackMatrixSection({ pack }: ModpackMatrixSectionProps) {
  const { setIsSingleColumn } = useContext(ModpackDetailPageContext);
  const { dataRegistry } = useContext(DataRegistryContext);

  const ref = useRef<HTMLDivElement>(null);
  const onResize = useCallback<ResizeObserverEntryCallback>(
    entry => {
      if (
        entry.target.parentElement?.parentElement &&
        entry.contentRect.width >= entry.target.parentElement.parentElement.offsetWidth - 100
      ) {
        setIsSingleColumn(true);
      } else {
        setIsSingleColumn(false);
      }
    },
    [setIsSingleColumn],
  );
  useResizeObserver(ref.current, onResize);
  useMounted();

  const [modsToFetch, setModsToFetch] = useState(() =>
    pack.mods.filter(
      mod =>
        !mod.minGameVersionFetched ||
        gameVersionComparator(mod.minGameVersionFetched, pack.versions.min) > 0 ||
        mod.platforms.some(
          p => !p.lastUpdated || p.lastUpdated < Date.now() - DATA_REGISTRY_CACHE_LIFESPAN,
        ),
    ),
  );
  const canRefreshInBackground = useMemo(
    () =>
      pack.mods.every(
        mod =>
          !!mod.minGameVersionFetched &&
          gameVersionComparator(mod.minGameVersionFetched, pack.versions.min) <= 0,
      ),
    [pack.mods, pack.versions.min],
  );

  const [progress, clearProgress, , workerApi] = useDataRefreshProgress(pack.id);
  useEffect(() => {
    if (progress?.complete) {
      setModsToFetch([]);
      clearProgress();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [progress?.complete]);

  const modsToFetchEquality =
    !dataRegistry || !workerApi ? "" : modsToFetch.map(m => m.id).join(",");
  useEffect(() => {
    if (!workerApi || !modsToFetch.length) {
      return;
    }
    // prevent duping the request in StrictMode
    const timer = setTimeout(async () => {
      workerApi.sendRequest({
        type: "start-refresh",
        packId: pack.id,
        mods: modsToFetch.map(m => m.id),
        minVersion: pack.versions.min,
        runImmediately: true,
      });
    }, 10);
    return () => {
      clearTimeout(timer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [modsToFetchEquality]);

  const refreshIndicator = (
    <ProgressIndicator
      value={progress?.total === 1 ? undefined : progress?.current?.index}
      total={progress?.total}
      size={36}
      variant="circular"
      tooltipText={
        progress?.current?.name ? `Currently fetching: ${progress.current.name}` : undefined
      }
    />
  );

  return (
    <Box mt={6} ref={ref}>
      {!modsToFetch.length || canRefreshInBackground ? (
        <ModpackMatrixContent
          pack={pack}
          refreshIndicator={progress && !progress.complete ? refreshIndicator : undefined}
        />
      ) : (
        <ModpackMatrixContentLoading
          info={
            <ProgressLabel as="div" variant="body1" color="textSecondary">
              Fetching mod versions {refreshIndicator}
            </ProgressLabel>
          }
        />
      )}
    </Box>
  );
}
