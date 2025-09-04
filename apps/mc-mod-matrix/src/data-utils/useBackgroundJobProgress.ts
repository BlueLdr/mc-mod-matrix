import { useContext, useEffect, useState } from "react";

import { DataRegistryContext } from "~/context";
import { MessageType } from "~/data";

import type { BackgroundJobProgressData, Worker } from "~/data";

//================================================

export type UseBackgroundJobProgressOptions = {
  onCancel?: () => void;
  autoHide?: number | false;
};

export const useBackgroundJobProgress = <JType extends Worker.JobType>(
  jobType: JType,
  parseMessage: (
    message: Worker.ProgressMessage<JType> | Worker.CompleteMessage<JType>,
  ) => Pick<BackgroundJobProgressData, "current" | "total" | "currentName"> & { message?: string },
  jobId: (Worker.JobMessage & { jobType: JType })["id"],
  { onCancel, autoHide = 10000 }: UseBackgroundJobProgressOptions = {},
) => {
  const { workerApi } = useContext(DataRegistryContext);
  const [jobProgress, setJobProgress] = useState<BackgroundJobProgressData>();
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    if (!workerApi) {
      return;
    }
    const onProgress = (data: Worker.JobMessageWith<Worker.MessageType.Progress, JType>) => {
      const parsed = parseMessage(data);
      setJobProgress(state => ({
        paused: false,
        total: parsed.total,
        complete: false,
        current: parsed.current ?? state?.current,
      }));
    };
    const onPause = () => {
      setJobProgress(state => (state ? { ...state, paused: true } : state));
    };
    const onComplete = (data: Worker.JobMessageWith<Worker.MessageType.Complete, JType>) => {
      const parsed = parseMessage(data);
      setJobProgress({ complete: true, total: parsed.total });
    };
    const onError = (data: Worker.JobMessageWith<Worker.MessageType.Error, JType>) => {
      setJobProgress(state =>
        data.message
          ? {
              total: state?.total ?? 0,
              complete: false,
              error: new Error(data.message),
            }
          : undefined,
      );
    };

    workerApi.on(MessageType.Progress, jobType, jobId, onProgress);
    workerApi.on(MessageType.Pause, jobType, jobId, onPause);
    workerApi.on(MessageType.Complete, jobType, jobId, onComplete);
    workerApi.on(MessageType.Error, jobType, jobId, onError);
    return () => {
      workerApi.off(MessageType.Progress, jobType, jobId, onProgress);
      workerApi.off(MessageType.Pause, jobType, jobId, onPause);
      workerApi.off(MessageType.Complete, jobType, jobId, onComplete);
      workerApi.off(MessageType.Error, jobType, jobId, onError);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [jobId, jobType, workerApi]);

  useEffect(() => {
    const _onCancel = () => {
      setJobProgress(undefined);
      onCancel?.();
    };
    workerApi?.on(MessageType.Cancel, jobType, jobId, _onCancel);
    return () => workerApi?.off(MessageType.Cancel, jobType, jobId, _onCancel);
  }, [onCancel, jobId, workerApi, jobType]);

  useEffect(() => {
    if (jobProgress?.complete == null) {
      setIsRunning(false);
      return;
    }
    if (!jobProgress.complete) {
      setIsRunning(true);
    } else if (autoHide !== false) {
      const timer = setTimeout(() => {
        setIsRunning(false);
      }, autoHide);
      return () => clearTimeout(timer);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [jobProgress?.complete]);

  const clearJobProgress = () => {
    setJobProgress(undefined);
    setIsRunning(false);
  };

  return [jobProgress, clearJobProgress, isRunning, workerApi] as const;
};
