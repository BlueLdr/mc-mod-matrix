"use client";

import { gameVersionComparator, getMinGameVersion, getVariableInterval } from "@mcmm/utils";

import {
  DATA_REGISTRY_CACHE_LIFESPAN,
  DATA_REGISTRY_FETCH_INTERVAL,
  DATA_REGISTRY_REFRESH_INTERVAL,
} from "../constants";
import { DataRegistryHelper } from "../../helper";
import { loadDataRegistryDb } from "../../storage";
import { MessageType, JobType } from "../types";
import { JobHandler } from "./job-handler";

import type * as Worker from "../types";
import type { Mod } from "@mcmm/data";
import type { DataRegistryDb } from "../../types";

//================================================

export class RefreshJobHandler extends JobHandler<Worker.RefreshJobState> {
  constructor(startJob: (job: Worker.RefreshJobState) => unknown, modsToAutoRefresh?: Mod["id"][]) {
    super();

    this.db = loadDataRegistryDb();
    this.helper = new DataRegistryHelper(this.db);
    this.modsToAutoRefresh = modsToAutoRefresh;

    if (modsToAutoRefresh?.length) {
      this.createJob({ mods: modsToAutoRefresh }).then(
        newJob =>
          newJob &&
          setTimeout(() => {
            startJob(newJob);
          }, 1000),
      );
    }
  }

  public readonly type = JobType.Refresh;

  private db: DataRegistryDb;
  private helper: DataRegistryHelper;
  private modsToAutoRefresh: Mod["id"][] | undefined;

  private refreshTimer: any = undefined;

  static readonly cacheLifespan: number = DATA_REGISTRY_CACHE_LIFESPAN;
  static readonly refreshInterval: number = DATA_REGISTRY_REFRESH_INTERVAL;
  static readonly fetchInterval: number = DATA_REGISTRY_FETCH_INTERVAL;

  static get variableFetchInterval() {
    return getVariableInterval(this.fetchInterval);
  }

  //================================================

  public createJob = async (
    args: Worker.RefreshJob,
  ): Promise<Worker.RefreshJobState | undefined> => {
    this.debugLog("Creating refresh job for", args);
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
          args.forceRun ||
          !minVersionFetched ||
          (args.minVersion && gameVersionComparator(minVersionFetched, args.minVersion) > 0) ||
          !p.lastUpdated ||
          p.lastUpdated < Date.now() - RefreshJobHandler.cacheLifespan
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

    let job: Worker.RefreshJob;
    if (!args.packId) {
      job = {
        mods: args.mods,
        minVersion: undefined,
        packId: undefined,
        forceRun: args.forceRun,
      } satisfies Worker.RefreshAutoJob;
    } else {
      job = {
        mods: args.mods,
        minVersion: args.minVersion,
        packId: args.packId,
        forceRun: args.forceRun,
      } satisfies Worker.RefreshPackJob;
    }

    this.debugLog("Mods to update:", modsToUpdate);
    return {
      job,
      type: JobType.Refresh,
      data: {
        modsRemaining: modsToUpdate,
        total: modsToUpdate.length,
      },
    };
  };

  //================================================

  public executeJobStep = async (state: Worker.RefreshJobState) => {
    const {
      job: currentJob,
      data: { modsRemaining, total },
    } = state;
    const nextMod = modsRemaining.shift();
    if (!nextMod) {
      return true;
    }

    this.requestLogger.groupCollapsed(`Refreshing versions for mod "${nextMod.name}"...`);
    JobHandler.sendMessage({
      type: MessageType.Progress,
      jobType: JobType.Refresh,
      total: total,
      current: total - (modsRemaining.length + 1),
      currentName: nextMod.name,
      id: currentJob.packId ?? "",
    });

    const minGameVersion = getMinGameVersion(currentJob.minVersion, nextMod.minGameVersionFetched);
    if (!minGameVersion) {
      this.requestLogger.debug(`No minVersion found, aborting...`, nextMod);
      return false;
    }
    await await this.helper
      .refreshModVersions(nextMod.platforms, minGameVersion, JobHandler.ENABLE_REQUEST_LOGGING)
      .then(async () => await this.helper.updateModVersionFetched(nextMod.id, minGameVersion))
      .catch(error => {
        JobHandler.sendMessage({
          type: MessageType.Error,
          jobType: JobType.Refresh,
          message: error.message,
          id: currentJob.packId ?? "",
        });
      });
    this.requestLogger.groupEnd();

    if (modsRemaining.length && !state.paused && !state.cancelled) {
      await new Promise<void>(resolve =>
        setTimeout(() => resolve(), RefreshJobHandler.variableFetchInterval),
      );
    }

    return !modsRemaining?.length;
  };

  isJobComplete(job: Worker.RefreshJobState): boolean {
    return !job.data.modsRemaining?.length;
  }

  //================================================

  public scheduleAutoJobs(onTimeout: (job: Worker.RefreshJobState) => void) {
    if (!this.refreshTimer && this.modsToAutoRefresh?.length) {
      this.debugLog("Scheduling next auto-refresh");
      this.refreshTimer = setTimeout(async () => {
        this.debugLog("Auto-refresh timeout finished, running auto-refresh");
        this.refreshTimer = null;
        const newJob = await this.createJob({ mods: this.modsToAutoRefresh ?? [] });
        if (newJob) {
          onTimeout(newJob);
        }
      }, RefreshJobHandler.refreshInterval);
    }
  }

  //================================================

  public isSubsetOfExistingJob = (
    request: Worker.RefreshJob,
    existingItem: Worker.RefreshJobState,
  ) => {
    return (
      request.mods.every(id => existingItem.job.mods.includes(id)) &&
      !!request.minVersion &&
      !!existingItem.job.minVersion &&
      gameVersionComparator(request.minVersion, existingItem.job.minVersion) >= 0
    );
  };

  public isSupersetOfExistingJob = (
    request: Worker.RefreshJob,
    existingItem: Worker.RefreshJobState,
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

  public matchesExistingJob(
    request: Worker.JobRequest & {
      jobType: JobType.Refresh;
    },
    existingJob: Worker.RefreshJobState,
  ): boolean {
    return request.packId === existingJob.job.packId;
  }

  //================================================

  public onStart(state: Worker.RefreshJobState) {
    JobHandler.sendMessage({
      type: MessageType.Progress,
      jobType: JobType.Refresh,
      message: `${state.paused ? "Resuming" : "Starting"} background refresh job for ${state.job.packId ? `pack ${state.job.packId}` : "common mods"}...`,
      total: state.data.total,
      id: state.job.packId ?? "",
    });
  }

  public onPause(state: Worker.RefreshJobState) {
    JobHandler.sendMessage({
      type: MessageType.Pause,
      jobType: JobType.Refresh,
      message: `Pausing background refresh job for ${state.job.packId ? `pack ${state.job.packId}` : "common mods"}...`,
      id: state.job.packId ?? "",
    });
  }

  public onCancel(state: Worker.RefreshJobState) {
    JobHandler.sendMessage({
      type: MessageType.Cancel,
      jobType: JobType.Refresh,
      message: `Cancelling background refresh job for ${state.job.packId ? `pack ${state.job.packId}` : "common mods"}.`,
      id: state.job.packId ?? "",
    });
  }

  public onComplete(state: Worker.RefreshJobState) {
    JobHandler.sendMessage({
      type: MessageType.Complete,
      jobType: JobType.Refresh,
      id: state.job.packId ?? "",
      total: state.data.total,
      message: `Completed background refresh job for ${state.job.packId ? `pack ${state.job.packId}` : "common mods"}`,
    });
  }

  onError(state: Worker.RefreshJobState) {
    JobHandler.sendMessage({
      type: MessageType.Error,
      jobType: JobType.Refresh,
      message: state.error?.message,
      id: state.job.packId ?? "",
    });
  }

  public onReject(request: Worker.RefreshStartRequest) {
    JobHandler.sendMessage({
      type: MessageType.Cancel,
      jobType: JobType.Refresh,
      id: request.packId,
      message: `Rejecting background refresh job for ${request.packId ? `pack ${request.packId}` : "common mods"} (no updates needed)`,
    });
  }
}
