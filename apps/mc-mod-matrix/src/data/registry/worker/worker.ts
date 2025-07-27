"use client";

import { difference } from "lodash";

import { gameVersionComparator, getMinGameVersion } from "@mcmm/utils";

import { loadDataRegistryDb } from "../storage";
import { DataRegistryHelper } from "../helper";
import {
  DATA_REGISTRY_CACHE_LIFESPAN,
  DATA_REGISTRY_REFRESH_INTERVAL,
  DATA_REGISTRY_FETCH_INTERVAL,
} from "./constants";

import type { Mod } from "@mcmm/data";
import type { DataRegistryDb } from "../types";
import type {
  WorkerBackgroundRefreshJob,
  WorkerBackgroundRefreshStartRequest,
  WorkerBackgroundRefreshState,
  WorkerMessage,
  WorkerRequest,
  WorkerUpdateCommonModsRequest,
} from "./types";

const _enableRequestLogging = process.env.NEXT_PUBLIC_MCMM_DATA_REGISTRY_WORKER_LOGGING;
const ENABLE_REQUEST_LOGGING = ["true", "1"].includes(_enableRequestLogging?.toLowerCase() ?? "");

//===============================================

export class DataRegistryWorker {
  constructor(modsToAutoRefresh?: Mod["id"][]) {
    this.db = loadDataRegistryDb();
    this.helper = new DataRegistryHelper(this.db);
    this.modsToAutoRefresh = modsToAutoRefresh;

    this.on("start-refresh", this.handleJobRequest);
    this.on("update-common-mods", this.handleUpdateCommonMods);

    console.log("Loaded DataRegistry web worker");
    if (modsToAutoRefresh?.length) {
      this.createJob({ mods: modsToAutoRefresh }).then(
        newJob =>
          newJob &&
          setTimeout(() => {
            this.startJob(newJob);
          }, 1000),
      );
    }

    this.ENABLE_REQUEST_LOGGING = ENABLE_REQUEST_LOGGING;
  }

  db: DataRegistryDb;
  helper: DataRegistryHelper;
  private modsToAutoRefresh: Mod["id"][] | undefined;

  private queue: WorkerBackgroundRefreshState[] = [];
  private currentState: WorkerBackgroundRefreshState | null = null;

  private refreshTimer: any = undefined;

  static readonly cacheLifespan: number = DATA_REGISTRY_CACHE_LIFESPAN;
  static readonly refreshInterval: number = DATA_REGISTRY_REFRESH_INTERVAL;
  static readonly fetchInterval: number = DATA_REGISTRY_FETCH_INTERVAL;

  static get variableFetchInterval() {
    return (
      this.fetchInterval + (Math.random() * 0.5 * this.fetchInterval - 0.25 * this.fetchInterval)
    );
  }

  private DEBUG_LOGGING = false;
  private ENABLE_REQUEST_LOGGING = ENABLE_REQUEST_LOGGING;

  private debugLog = (...args: any[]) => {
    if (!this.DEBUG_LOGGING) {
      return;
    }
    console.debug(...args);
  };

  private get requestLogger() {
    if (this.ENABLE_REQUEST_LOGGING) {
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

  //================================================

  private executeJob = async (args: WorkerBackgroundRefreshState) => {
    const { job: currentJob, modsRemaining, total } = args;
    while (
      this.currentState?.job === currentJob &&
      modsRemaining?.length &&
      !args.paused &&
      !args.cancelled
    ) {
      const nextMod = modsRemaining.shift();
      if (!nextMod) {
        break;
      }

      this.requestLogger.groupCollapsed(`Refreshing versions for mod "${nextMod.name}"...`);
      this.sendMessage({
        type: "progress",
        total: total,
        current: { index: currentJob.mods.length - (modsRemaining.length + 1), name: nextMod.name },
        packId: currentJob.packId,
      });

      const minGameVersion =
        nextMod.minGameVersionFetched && currentJob.minVersion
          ? getMinGameVersion(currentJob.minVersion, nextMod.minGameVersionFetched)
          : (currentJob.minVersion ?? nextMod.minGameVersionFetched);
      if (!minGameVersion) {
        this.requestLogger.debug(`No minVersion found, aborting...`, nextMod);
        continue;
      }
      await await this.helper
        .refreshModVersions(nextMod.platforms, minGameVersion, this.ENABLE_REQUEST_LOGGING)
        .catch(error => {
          this.sendMessage({ type: "error", message: error.message, packId: currentJob.packId });
        });
      this.requestLogger.groupEnd();

      if (modsRemaining.length && !args.paused && !args.cancelled) {
        await new Promise<void>(resolve =>
          setTimeout(() => resolve(), DataRegistryWorker.variableFetchInterval),
        );
      }
    }

    return !modsRemaining?.length;
  };

  private createJob = async (
    args: WorkerBackgroundRefreshJob,
  ): Promise<WorkerBackgroundRefreshState | undefined> => {
    this.debugLog("Creating job for", args);
    if (!args.mods.length) {
      return;
    }
    const mods = await this.helper.getModsByIds(args.mods);
    const modsToUpdate: Mod[] = [];
    for (const mod of mods) {
      const needsUpdate = mod.platforms.some(p => {
        if (!p) {
          return false;
        }
        const minVersionFetched = mod.minGameVersionFetched ?? p.minGameVersionFetched;
        if (!minVersionFetched && !args.minVersion) {
          return false;
        }
        return (
          args.forceUpdate ||
          !minVersionFetched ||
          (args.minVersion && gameVersionComparator(minVersionFetched, args.minVersion) > 0) ||
          !p.lastUpdated ||
          p.lastUpdated < Date.now() - DataRegistryWorker.cacheLifespan
        );
      });
      if (needsUpdate) {
        modsToUpdate.push(mod);
      }
    }
    if (modsToUpdate.length === 0) {
      this.debugLog("All mods up to date, aborting");
      return;
    }

    this.debugLog("Mods to update:", modsToUpdate);
    return {
      job: args,
      modsRemaining: modsToUpdate,
      total: modsToUpdate.length,
    };
  };

  //================================================

  private processQueue = () => {
    this.debugLog("Processing queue");
    if (this.currentState) {
      this.debugLog("A job is in progress, aborting");
      return;
    }
    const nextItem = this.queue.shift();
    this.debugLog("Next item:", nextItem);
    if (!nextItem) {
      if (!this.refreshTimer && this.modsToAutoRefresh?.length) {
        this.debugLog("Scheduling next auto-refresh");
        this.refreshTimer = setTimeout(async () => {
          this.debugLog("Auto-refresh timeout finished, running auto-refresh");
          this.refreshTimer = null;
          const newJob = await this.createJob({ mods: this.modsToAutoRefresh ?? [] });
          if (newJob) {
            this.queue.push(newJob);
            this.processQueue();
          }
        }, DataRegistryWorker.refreshInterval);
      }
      return;
    }

    if (!nextItem.modsRemaining.length) {
      this.debugLog("Job has no mods remaining, skipping");
      this.processQueue();
      return;
    }

    setTimeout(() => {
      this.startJob(nextItem);
    }, 0);
  };

  private startJob = async (state: WorkerBackgroundRefreshState) => {
    if (this.currentState) {
      this.debugLog("Another job is in progress, placing this job at the front of the queue");
      this.queue.unshift(state);
      if (!this.currentState.cancelled) {
        this.debugLog("\tPausing existing job...");
        this.currentState.paused = true;
      }
      return;
    }
    this.debugLog("Starting job ", state);
    this.sendMessage({
      type: "progress",
      message: `${state.paused ? "Resuming" : "Starting"} background refresh job for ${state.job.packId ? `pack ${state.job.packId}` : "common mods"}...`,
      total: state.total,
      packId: state.job.packId,
    });

    state.paused = false;
    this.currentState = state;
    this.executeJob(state).then(success => {
      this.debugLog("Job 'finished'; success =", success);
      if (success) {
        this.sendMessage({
          type: "complete",
          packId: state.job.packId,
          total: state.total,
          message: `Completed background refresh job for ${state.job.packId ? `pack ${state.job.packId}` : "common mods"}`,
        });
      } else if (state.paused) {
        this.debugLog("Job was paused, updating state...");
        this.pauseCurrentJob();
      } else if (state.cancelled) {
        this.debugLog("Job was cancelled, updating state...");
        this.cancelCurrentJob();
      }
      this.currentState = null;
      this.processQueue();
    });
  };

  private pauseCurrentJob = () => {
    if (!this.currentState) {
      return;
    }

    const nextItem = this.queue.shift();
    if (!nextItem) {
      return;
    }

    const state = this.currentState;
    this.sendMessage({
      type: "pause",
      message: `Pausing background refresh job for ${state.job.packId ? `pack ${state.job.packId}` : "common mods"}...`,
      packId: state.job.packId,
    });

    this.queue.unshift(state);
    this.queue.unshift(nextItem);

    this.currentState = null;
  };

  private cancelCurrentJob = () => {
    if (!this.currentState) {
      return;
    }

    const state = this.currentState;
    this.sendMessage({
      type: "cancel",
      message: `Cancelling background refresh job for ${state.job.packId ? `pack ${state.job.packId}` : "common mods"}.`,
      packId: state.job.packId,
    });

    this.currentState = null;
  };

  //================================================

  private isSubsetOfExistingJob = (
    request: WorkerBackgroundRefreshJob,
    existingItem: WorkerBackgroundRefreshState,
  ) => {
    return (
      request.mods.every(id => existingItem.job.mods.includes(id)) &&
      request.minVersion &&
      existingItem.job.minVersion &&
      gameVersionComparator(request.minVersion, existingItem.job.minVersion) >= 0
    );
  };

  private isSupersetOfExistingJob = (
    request: WorkerBackgroundRefreshJob,
    existingItem: WorkerBackgroundRefreshState,
  ) => {
    return (
      existingItem.job.mods.every(id => request.mods.includes(id)) &&
      request.mods.length > existingItem.job.mods.length &&
      ((!request.minVersion && !existingItem.job.minVersion) ||
        (!!request.minVersion &&
          !!existingItem.job.minVersion &&
          gameVersionComparator(request.minVersion, existingItem.job.minVersion) < 0))
    );
  };

  private handleJobRequest = async (request: WorkerBackgroundRefreshStartRequest) => {
    this.debugLog("Got request for new job:", request);
    const existingItem = [...this.queue, this.currentState].find(
      item => request.packId === item?.job.packId,
    );
    this.debugLog("Existing item:", existingItem);

    if (existingItem && this.isSubsetOfExistingJob(request, existingItem)) {
      this.debugLog("New job is subset of existing job, returning...");
      return;
    }

    const newItem =
      (await this.createJob({
        mods: request.mods,
        minVersion: request.minVersion,
        packId: request.packId,
        forceUpdate: request.forceUpdate,
      })) || existingItem;
    const shouldReplace =
      !!existingItem &&
      newItem !== existingItem &&
      (this.isSupersetOfExistingJob(request, existingItem) || request.forceUpdate);
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
      this.sendMessage({
        type: "cancel",
        packId: request.packId,
        message: `Rejecting background refresh job for ${request.packId ? `pack ${request.packId}` : "common mods"} (no updates needed)`,
      });
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

  private handleUpdateCommonMods = async ({
    modsToAutoRefresh: updatedList,
  }: WorkerUpdateCommonModsRequest) => {
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
      state => !!state && !state.job.packId,
    );
    if (!existingJob) {
      return;
    }

    const newJob = await this.createJob({ mods: diff });
    if (!newJob) {
      return;
    }
    existingJob.job.mods = updatedList;
    existingJob.total += newJob.total;
    newJob.modsRemaining.forEach(mod => existingJob.modsRemaining.push(mod));
  };

  //================================================

  public on = <T extends WorkerRequest>(type: T["type"], callback: (args: T) => void) => {
    if (typeof globalThis !== "undefined" && "Worker" in globalThis) {
      addEventListener("message", (e: MessageEvent<T>) => {
        if (e.data.type === type) {
          callback(e.data);
        }
      });
    }
  };

  private sendMessage = (args: WorkerMessage) => {
    if (typeof globalThis !== "undefined" && "Worker" in globalThis) {
      postMessage(args);
    }
  };
}
