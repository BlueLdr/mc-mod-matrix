"use client";

import { useContext, useEffect, useState } from "react";

import { ProgressIndicator } from "~/components";
import { DataRegistryContext } from "~/context";

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
  const { refreshProgress, clearRefreshProgress } = useContext(DataRegistryContext);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    if (refreshProgress?.complete == null) {
      setIsRefreshing(false);
      return;
    }
    if (!refreshProgress.complete) {
      setIsRefreshing(true);
    } else {
      const timer = setTimeout(() => {
        setIsRefreshing(false);
      }, 10000);
      return () => clearTimeout(timer);
    }
  }, [refreshProgress?.complete]);

  if (!isRefreshing && !refreshProgress) {
    return null;
  }

  const currentIndex =
    refreshProgress?.current?.index ?? (refreshProgress?.complete ? refreshProgress.total : -1);

  let text = "Refreshing mod version data...";
  if (refreshProgress?.complete) {
    text = "Finished refreshing mod version data!";
  } else if (refreshProgress?.current) {
    text = `Refreshing mod version data (${currentIndex}/${refreshProgress.total})`;
  }

  const currentItemText = `Currently refreshing: ${refreshProgress?.current?.name}`;
  const tooltipText =
    variant === "linear" ? (
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
      onExited={() => clearRefreshProgress}
    >
      <Divider />
      <ProgressIndicator {...progressProps} />
    </Collapse>
  );
}
