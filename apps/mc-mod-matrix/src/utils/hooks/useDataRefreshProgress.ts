import { useContext, useEffect, useState } from "react";

import { DataRegistryContext } from "~/context";

import type {
  BackgroundRefreshProgressData,
  WorkerBackgroundRefreshCompleteMessage,
  WorkerBackgroundRefreshFailedMessage,
  WorkerBackgroundRefreshProgressMessage,
  WorkerMessage,
} from "~/data";

//================================================

export const useDataRefreshProgress = (packId?: string, onCancel?: () => void) => {
  const { workerApi } = useContext(DataRegistryContext);
  const [refreshProgress, setRefreshProgress] = useState<BackgroundRefreshProgressData>();
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    if (!workerApi) {
      return;
    }
    const onProgress = (data: WorkerBackgroundRefreshProgressMessage) => {
      setRefreshProgress(state => ({
        paused: false,
        total: data.total,
        complete: false,
        current: data.current ?? state?.current,
      }));
    };
    const onPause = () => {
      setRefreshProgress(state => (state ? { ...state, paused: true } : state));
    };
    const onComplete = (data: WorkerBackgroundRefreshCompleteMessage) => {
      setRefreshProgress({ complete: true, total: data.total });
    };
    const onError = (data: WorkerMessage & WorkerBackgroundRefreshFailedMessage) => {
      setRefreshProgress(state =>
        data.message
          ? {
              total: state?.total ?? 0,
              complete: false,
              error: new Error(data.message),
            }
          : undefined,
      );
    };

    workerApi.on("progress", packId, onProgress);
    workerApi.on("pause", packId, onPause);
    workerApi.on("complete", packId, onComplete);
    workerApi.on("error", packId, onError);
    return () => {
      workerApi.off("progress", packId, onProgress);
      workerApi.off("pause", packId, onPause);
      workerApi.off("complete", packId, onComplete);
      workerApi.off("error", packId, onError);
    };
  }, [packId, workerApi]);

  useEffect(() => {
    const _onCancel = () => {
      setRefreshProgress(undefined);
      onCancel?.();
    };
    workerApi?.on("cancel", packId, _onCancel);
    return () => workerApi?.off("cancel", packId, _onCancel);
  }, [onCancel, packId, workerApi]);

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

  const clearRefreshProgress = () => {
    setRefreshProgress(undefined);
    setIsRefreshing(false);
  };

  return [refreshProgress, clearRefreshProgress, isRefreshing, workerApi] as const;
};
