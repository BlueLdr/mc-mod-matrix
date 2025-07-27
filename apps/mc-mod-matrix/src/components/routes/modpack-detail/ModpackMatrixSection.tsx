"use client";

import { styled } from "@mui/material/styles";
import { useCallback, useContext, useEffect, useRef, useState } from "react";

import { gameVersionComparator } from "@mcmm/utils";
import { ModpackDetailPageContext, ProgressIndicator } from "~/components";
import { DataRegistryContext } from "~/context";
import { useMounted, useResizeObserver } from "~/utils";

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
        gameVersionComparator(mod.minGameVersionFetched, pack.versions.min) > 0,
    ),
  );
  const [progress, setProgress] = useState<{ index: number; name: string }>();

  const modsToFetchEquality = !dataRegistry ? "" : modsToFetch.map(m => m.id).join(",");
  useEffect(() => {
    if (!dataRegistry || !modsToFetch.length) {
      return;
    }
    const timer = setTimeout(async () => {
      for (const mod of modsToFetch) {
        setProgress({ index: modsToFetch.indexOf(mod), name: mod.name });
        await dataRegistry?.storeMod(mod, pack.versions.min);
      }
      setModsToFetch([]);
      setProgress(undefined);
    }, 10);
    return () => {
      clearTimeout(timer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [modsToFetchEquality]);

  return (
    <Box mt={6} ref={ref}>
      {!modsToFetch.length ? (
        <ModpackMatrixContent pack={pack} />
      ) : (
        <ModpackMatrixContentLoading
          info={
            <ProgressLabel as="div" variant="body1" color="textSecondary">
              Fetching mod versions{" "}
              <ProgressIndicator
                value={modsToFetch.length === 1 ? undefined : progress?.index}
                total={modsToFetch.length}
                size={36}
                variant="circular"
                tooltipText={progress?.name ? `Currently fetching: ${progress.name}` : undefined}
              />{" "}
            </ProgressLabel>
          }
        />
      )}
    </Box>
  );
}
