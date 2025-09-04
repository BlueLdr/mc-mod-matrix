"use client";

import type * as Worker from "../types";

//================================================

export abstract class JobHandler<JobState extends Worker.JobState> {
  public static sendMessage = (args: Worker.JobMessage) => {
    if (typeof globalThis !== "undefined" && "Worker" in globalThis) {
      postMessage(args);
    }
  };

  protected DEBUG_LOGGING = false;
  protected debugLog = (...args: any[]) => {
    if (!this.DEBUG_LOGGING) {
      return;
    }
    console.debug(...args);
  };

  public static ENABLE_REQUEST_LOGGING: boolean;

  protected get requestLogger() {
    if (JobHandler.ENABLE_REQUEST_LOGGING) {
      return console;
    }
    return {
      log: () => {},
      debug: () => {},
      info: () => {},
      groupCollapsed: () => {},
      groupEnd: () => {},
    };
  }

  public abstract readonly type: JobState["type"];

  public abstract createJob(job: JobState["job"]): Promise<JobState | undefined>;

  public abstract executeJobStep(state: JobState): Promise<boolean>;

  public abstract isSubsetOfExistingJob(job: JobState["job"], existingJob: JobState): boolean;

  public abstract isSupersetOfExistingJob(job: JobState["job"], existingJob: JobState): boolean;

  public abstract matchesExistingJob(
    request: Worker.JobRequestWith<Worker.JobRequestType, JobState["type"]>,
    existingJob: JobState,
  ): boolean;

  public abstract isJobComplete(job: JobState): boolean;

  public abstract scheduleAutoJobs(onTimeout: (job: JobState) => void): void;

  //================================================

  public abstract onStart(state: JobState): void;

  // public abstract onProgress(state: JobState): void;
  public abstract onPause(state: JobState): void;

  public abstract onCancel(state: JobState): void;

  public abstract onComplete(state: JobState): void;

  public abstract onReject(request: Worker.JobStartRequest<JobState["type"]>): void;

  public abstract onError(state: JobState): void;
}
