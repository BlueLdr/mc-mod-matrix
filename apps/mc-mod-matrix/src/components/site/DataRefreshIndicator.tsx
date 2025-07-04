import { useContext, useEffect, useState } from "react";

import { DataRegistryContext } from "~/context";

import CircularProgress from "@mui/material/CircularProgress";
import Collapse from "@mui/material/Collapse";
import Divider from "@mui/material/Divider";
import Grid from "@mui/material/Grid";
import LinearProgress from "@mui/material/LinearProgress";
import Slide from "@mui/material/Slide";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import Check from "@mui/icons-material/Check";

//================================================

export type DataRefreshIndicatorProps = {
  variant?: "linear" | "circular";
};

export function DataRefreshIndicator({ variant = "linear" }: DataRefreshIndicatorProps) {
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

  const progressProps = {
    variant: currentIndex < 0 ? "indeterminate" : "determinate",
    color: refreshProgress?.complete ? "success" : undefined,
    value: refreshProgress ? (100 * currentIndex) / refreshProgress.total : undefined,
  } as const;

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

  const withTooltip = (content: React.ReactElement | string) => (
    <Tooltip title={tooltipText}>
      {typeof content === "string" ? <span>{content}</span> : content}
    </Tooltip>
  );

  if (variant === "circular") {
    return (
      <Slide
        direction="right"
        in={isRefreshing}
        mountOnEnter
        unmountOnExit
        onExited={() => clearRefreshProgress()}
      >
        {withTooltip(
          <Grid position="relative" height={40} width={40}>
            <CircularProgress
              sx={{ position: "absolute", color: theme => theme.palette.background.layer }}
              variant="determinate"
              value={100}
            />
            <CircularProgress {...progressProps} />
            <Grid
              container
              sx={{
                position: "absolute",
                left: 0,
                top: 0,
                bottom: 0,
                right: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {refreshProgress?.complete ? (
                <Check />
              ) : progressProps.value != null ? (
                <Typography variant="caption" color="textSecondary" lineHeight={0}>
                  {Math.round(progressProps.value)}%
                </Typography>
              ) : undefined}
            </Grid>
          </Grid>,
        )}
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
      <Grid
        container
        alignItems="center"
        justifyContent="center"
        direction="column"
        p={4}
        spacing={3}
      >
        <Typography variant="caption">
          {refreshProgress?.current ? withTooltip(text) : text}
        </Typography>
        <LinearProgress {...progressProps} sx={{ width: "100%" }} />
      </Grid>
    </Collapse>
  );
}
