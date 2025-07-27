"use client";

import { ProgressIndicator } from "~/components";
import { useDataRefreshProgress } from "~/utils";

import Collapse from "@mui/material/Collapse";
import Divider from "@mui/material/Divider";
import Grid from "@mui/material/Grid";
import Slide from "@mui/material/Slide";

//================================================

export type BackgroundRefreshIndicatorProps = {
  variant?: "linear" | "circular";
};

export function BackgroundRefreshIndicator({
  variant = "linear",
}: BackgroundRefreshIndicatorProps) {
  const [refreshProgress, clearRefreshProgress, isRefreshing] = useDataRefreshProgress();
  if (!isRefreshing && !refreshProgress) {
    return null;
  }

  const currentIndex =
    refreshProgress?.current?.index ?? (refreshProgress?.complete ? refreshProgress.total : -1);

  let text = "Refreshing common mod version data...";
  if (refreshProgress?.complete) {
    text = "Finished refreshing common mod version data!";
  } else if (refreshProgress?.paused) {
    text = "Paused refreshing common mod version data";
  } else if (refreshProgress?.current) {
    text = `Refreshing common mod version data (${currentIndex}/${refreshProgress.total})`;
  }

  const currentItemText = `Currently refreshing: ${refreshProgress?.current?.name}`;
  const tooltipText = refreshProgress?.complete ? undefined : variant === "linear" ? (
    currentItemText
  ) : (
    <Grid container alignItems="center" direction="column">
      <span>{text}</span>
      {!!refreshProgress?.current && <span>{currentItemText}</span>}
    </Grid>
  );

  const progressProps = {
    value: currentIndex,
    total: refreshProgress?.total,
    color: refreshProgress?.complete ? "success" : undefined,
    variant,
    tooltipText,
    labelText: text,
    paused: refreshProgress?.paused,
  } as const;

  if (variant === "circular") {
    return (
      <Slide
        direction="right"
        in={isRefreshing}
        mountOnEnter
        unmountOnExit
        onExited={() => clearRefreshProgress()}
      >
        <ProgressIndicator {...progressProps} size={40} />
      </Slide>
    );
  }

  return (
    <Collapse
      in={isRefreshing}
      orientation="vertical"
      unmountOnExit
      mountOnEnter
      onExited={() => clearRefreshProgress()}
    >
      <Divider />
      <ProgressIndicator {...progressProps} />
    </Collapse>
  );
}
