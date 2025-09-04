"use client";

import { difference } from "lodash";

import { PlatformPlugin } from "@mcmm/platform";

import { DataRegistryHelper } from "../helper";
import { loadDataRegistryDb } from "../storage";
import { ExportJobHandler, JobHandler, RefreshJobHandler } from "./job-handlers";
import { JobRequestType, JobType } from "./types";

import type * as Worker from "./types";
import type { DistributiveIndex } from "@mcmm/types";
import type { DataRegistryDb } from "../types";
import type { GameVersion, Mod } from "@mcmm/data";

const _enableRequestLogging = process.env.NEXT_PUBLIC_MCMM_DATA_REGISTRY_WORKER_LOGGING;
const ENABLE_REQUEST_LOGGING = ["true", "1"].includes(_enableRequestLogging?.toLowerCase() ?? "");

//===============================================

type RequestHandler<Type extends Worker.JobRequestType> = <State extends Worker.JobState>(
  request: Worker.JobRequestWith<Type, State["type"]>,
  existingItem: State | null | undefined,
  handler: JobHandler<State>,
) => Promise<void>;

export class DataRegistryWorker {
  constructor(modsToAutoRefresh?: Mod["id"][], allGameVersions?: GameVersion[]) {
    this.db = loadDataRegistryDb();
    this.helper = new DataRegistryHelper(this.db);
    this.modsToAutoRefresh = modsToAutoRefresh;

    if (allGameVersions?.length) {
      PlatformPlugin.allGameVersions = allGameVersions;
    }

    this.jobHandlers = [
      new RefreshJobHandler(this.startJob, modsToAutoRefresh),
      new ExportJobHandler(),
    ];

    this.on("set-game-versions", this.setAllGameVersionsOnPlatformPlugin);
    this.on(JobRequestType.StartJob, this.handleJobRequest);
    this.on(JobRequestType.PauseJob, this.handleJobRequest);
    this.on(JobRequestType.ResumeJob, this.handleJobRequest);
    this.on(JobRequestType.CancelJob, this.handleJobRequest);
    this.on("update-common-mods", this.handleUpdateCommonMods);

    console.log("Loaded DataRegistry web worker");

    JobHandler.ENABLE_REQUEST_LOGGING = ENABLE_REQUEST_LOGGING;
  }

  jobHandlers: JobHandler<Worker.JobState>[];

  db: DataRegistryDb;
  helper: DataRegistryHelper;
  private modsToAutoRefresh: Mod["id"][] | undefined;

  private queue: Worker.JobState[] = [];
  private currentState: Worker.JobState | null = null;

  private DEBUG_LOGGING = false;

  private debugLog = (...args: any[]) => {
    if (!this.DEBUG_LOGGING) {
      return;
    }
    console.debug(...args);
  };

  private setAllGameVersionsOnPlatformPlugin(request: Worker.SetGameVersionsRequest) {
    PlatformPlugin.allGameVersions = request.allGameVersions;
  }

  //================================================

  private getHandler = <S extends Worker.JobState>(type: S["type"]) =>
    this.jobHandlers.find((h): h is JobHandler<S> => h.type === type);

  //================================================

  private executeJob = async <T extends Worker.JobState>(state: T, handler: JobHandler<T>) => {
    while (
      this.currentState?.job === state.job &&
      !handler.isJobComplete(state) &&
      !state.paused &&
      !state.cancelled &&
      !state.failed
    ) {
      const shouldAbort = await handler.executeJobStep(state);
      if (shouldAbort) {
        break;
      }
    }

    return handler.isJobComplete(state);
  };

  private createJob = <T extends Worker.JobState>(
    type: DistributiveIndex<T, "type">,
    job: DistributiveIndex<T, "job">,
  ): Promise<Worker.JobStateForType<T["type"]> | undefined> => {
    const handler = this.jobHandlers.find(h => h.type === type);
    if (!handler) {
      return Promise.reject(`Invalid job type "${type}"`);
    }

    return handler.createJob(job);
  };

  //================================================

  private processQueue = () => {
    this.debugLog("Processing queue");
    if (this.currentState) {
      this.debugLog("A job is in progress, aborting");
      return;
    }
    const nextJob = this.queue.shift();
    this.debugLog("Next job:", nextJob);
    if (!nextJob) {
      this.jobHandlers.forEach(handler => {
        handler.scheduleAutoJobs(newJob => {
          this.queue.push(newJob);
          this.processQueue();
        });
      });
      return;
    }

    const handler = this.getHandler(nextJob.type);
    if (!handler) {
      this.debugLog(`No handler found for job type ${nextJob.type}, skipping`);
      this.processQueue();
      return;
    }
    if (handler.isJobComplete(nextJob)) {
      this.debugLog("Job has no steps remaining, skipping");
      this.processQueue();
      return;
    }

    setTimeout(() => {
      this.startJob(nextJob);
    }, 0);
  };

  private startJob = async (state: Worker.JobState) => {
    if (this.currentState) {
      this.debugLog("Another job is in progress, placing this job at the front of the queue");
      this.queue.unshift(state);
      if (!this.currentState.cancelled && !this.currentState.failed) {
        this.debugLog("\tPausing existing job...");
        this.currentState.paused = true;
      }
      return;
    }
    const handler = this.getHandler(state.type);
    if (!handler) {
      this.debugLog(`No handler found for job type ${state.type}, skipping`);
      return;
    }

    this.debugLog(`${state.paused ? "Resuming" : "Starting"} job `, state);
    handler.onStart(state);

    state.paused = false;
    this.currentState = state;
    this.executeJob(state, handler).then(success => {
      this.debugLog("Job 'finished'; success =", success);
      if (success) {
        handler.onComplete(state);
      } else if (state.paused) {
        this.debugLog("Job was paused, updating state...");
        this.pauseCurrentJob();
      } else if (state.cancelled) {
        this.debugLog("Job was cancelled, updating state...");
        this.cancelCurrentJob();
      } else if (state.failed) {
        this.debugLog("Job failed, updating state...");
        this.failCurrentJob();
      }
      this.currentState = null;
      if (!state.paused || this.queue.length > 1) {
        this.processQueue();
      }
    });
  };

  private pauseCurrentJob = () => {
    if (!this.currentState) {
      return;
    }

    const nextItem = this.queue.shift();

    const state = this.currentState;
    this.getHandler(state.type)?.onPause(state);

    this.queue.unshift(state);
    if (nextItem) {
      this.queue.unshift(nextItem);
    }

    this.currentState = null;
  };

  private cancelCurrentJob = () => {
    if (!this.currentState) {
      return;
    }

    const state = this.currentState;
    this.getHandler(state.type)?.onCancel(state);

    this.currentState = null;
  };

  private failCurrentJob = () => {
    if (!this.currentState) {
      return;
    }
    const state = this.currentState;
    this.getHandler(state.type)?.onError?.(state);

    this.currentState = null;
  };

  //================================================

  private isStateForType = <S extends Worker.JobState>(
    state: Worker.JobState,
    type: S["type"],
  ): state is S => state.type === type;

  private handleJobRequest = async <T extends JobType, S extends Worker.JobStateForType<T>>(
    request: Worker.JobRequest,
  ) => {
    this.debugLog("Got request for job:", request);
    const handler = this.getHandler(request.jobType);
    if (!handler) {
      this.debugLog(`No handler found for job type ${request.jobType}, ignoring`);
      return;
    }

    const existingItem = [...this.queue, this.currentState].find(
      (item): item is S =>
        !!item &&
        this.isStateForType(item, request.jobType) &&
        handler.matchesExistingJob(request, item),
    );
    this.debugLog("Existing item:", existingItem);

    switch (request.type) {
      case JobRequestType.StartJob:
        return this.handleJobStartRequest(request, existingItem, handler);
      case JobRequestType.PauseJob:
        return this.handleJobPauseRequest(request, existingItem, handler);
      case JobRequestType.ResumeJob:
        return this.handleJobResumeRequest(request, existingItem, handler);
      case JobRequestType.CancelJob:
        return this.handleJobCancelRequest(request, existingItem, handler);
    }
  };

  private handleJobStartRequest: RequestHandler<Worker.JobRequestType.StartJob> = async (
    request,
    existingItem,
    handler,
  ) => {
    if (existingItem && handler.isSubsetOfExistingJob(request, existingItem)) {
      this.debugLog("New job is subset of existing job, returning...");
      return;
    }

    const newItem =
      (await handler
        .createJob(request)
        .catch(error => console.error("Failed to create job", error))) || existingItem;
    const shouldReplace =
      !!existingItem &&
      newItem !== existingItem &&
      (handler.isSupersetOfExistingJob(request, existingItem) || request.forceRun);
    if (shouldReplace) {
      this.debugLog("New job is superset of existing job");
    }

    // if new job is invalid, or if it already exists and either doesn't need to run now
    // or is already running, then abort
    if (
      !newItem ||
      (existingItem === newItem && (!request.runImmediately || existingItem === this.currentState))
    ) {
      this.debugLog("New job is invalid or is a duplicate");
      handler?.onReject(request);
      return;
    }

    // if the request doesn't need to run immediately and a job is in progress
    if (!request.runImmediately && this.currentState) {
      // if no job for this pack already exists
      if (!existingItem || !shouldReplace) {
        this.debugLog("Adding new job to the queue");
        // enqueue the new job
        this.queue.push(newItem);
      } else if (shouldReplace) {
        this.debugLog("Replacing existing job in the queue");
        // if the new job should overwrite the existing job
        const index = this.queue.indexOf(existingItem);
        if (index >= 0) {
          // replace the existing job with the new one
          this.queue[index] = newItem;
        }
      }
      return;
    }

    if (existingItem) {
      if (this.currentState === existingItem) {
        this.currentState.cancelled = true;
      } else {
        this.debugLog("Removing existing item from queue");
        this.queue = this.queue.filter(item => item !== existingItem);
      }
    }
    this.startJob(newItem);
  };

  private handleJobPauseRequest: RequestHandler<Worker.JobRequestType.PauseJob> = async (
    _,
    existingItem,
  ) => {
    if (!existingItem) {
      this.debugLog("No existing job with matching id, ignoring request.");
      return;
    }
    if (existingItem.paused) {
      this.debugLog("Existing job is already paused, ignoring request.");
      return;
    }
    if (existingItem.cancelled) {
      this.debugLog("Existing job is being cancelled, ignoring request.");
      return;
    }
    if (existingItem.failed) {
      this.debugLog("Existing job has failed, ignoring request.");
      return;
    }
    if (existingItem.job !== this.currentState?.job) {
      this.debugLog("Existing job is not currently running, ignoring request.");
      return;
    }
    this.currentState.paused = true;
  };

  private handleJobResumeRequest: RequestHandler<Worker.JobRequestType.ResumeJob> = async (
    _,
    existingItem,
  ) => {
    if (!existingItem) {
      this.debugLog("No existing job with matching id, ignoring request.");
      return;
    }
    if (!existingItem.paused) {
      this.debugLog("Existing job is not paused, ignoring request.");
      return;
    }
    if (existingItem.cancelled) {
      this.debugLog("Existing job is being cancelled, ignoring request.");
      return;
    }
    if (existingItem.failed) {
      this.debugLog("Existing job has failed, ignoring request.");
      return;
    }

    const index = this.queue.indexOf(existingItem);
    if (index < 0) {
      this.debugLog("Couldn't find job position in queue, aborting request.");
      return;
    }
    this.queue.splice(index, 1);
    if (!this.currentState) {
      this.startJob(existingItem);
    } else {
      this.queue.push(existingItem);
      this.currentState.paused = true;
    }
  };

  private handleJobCancelRequest: RequestHandler<Worker.JobRequestType.CancelJob> = async (
    request,
    existingItem,
    handler,
  ) => {
    if (!existingItem) {
      this.debugLog("No existing job with matching id, ignoring request.");
      return;
    }
    if (existingItem.cancelled) {
      this.debugLog("Existing job is already cancelled, ignoring request.");
      return;
    }
    if (existingItem.failed) {
      this.debugLog("Existing job has failed, ignoring request.");
      return;
    }
    if (existingItem.job === this.currentState?.job) {
      this.currentState.cancelled = true;
    } else {
      existingItem.cancelled = true;
      const index = this.queue.indexOf(existingItem);
      if (index < 0) {
        this.debugLog("Couldn't find job position in queue, aborting request.");
        return;
      }
      this.queue.splice(index, 1);
      handler.onCancel(existingItem);
    }
  };

  private handleUpdateCommonMods = async ({
    modsToAutoRefresh: updatedList,
  }: Worker.UpdateCommonModsRequest) => {
    if (!this.modsToAutoRefresh) {
      if (updatedList.length) {
        this.modsToAutoRefresh = updatedList;
      }
      return;
    }

    const diff = difference(updatedList, this.modsToAutoRefresh);
    this.modsToAutoRefresh = updatedList;
    if (diff.length === 0) {
      return;
    }
    const existingJob = [...this.queue, this.currentState].find(
      (state): state is Worker.RefreshJobState =>
        !!state && state.type === JobType.Refresh && !state.job.packId,
    );
    if (!existingJob) {
      return;
    }

    const newJob = await this.createJob<Worker.RefreshJobState>(JobType.Refresh, { mods: diff });
    if (!newJob) {
      return;
    }
    existingJob.job.mods = updatedList;
    existingJob.data.total += newJob.data.total;
    newJob.data.modsRemaining.forEach(mod => existingJob.data.modsRemaining.push(mod));
  };

  //================================================

  public on = <T extends Worker.Request["type"]>(
    type: T,
    callback: (args: Worker.Request & { type: T }) => void,
  ) => {
    if (typeof globalThis !== "undefined" && "Worker" in globalThis) {
      addEventListener("message", (e: MessageEvent<Worker.Request & { type: T }>) => {
        if (e.data.type === type) {
          callback(e.data);
        }
      });
    }
  };
}
