"use client";

import { capitalize } from "lodash";

import { createDisplayableError } from "@mcmm/types";
import { getVariableInterval } from "@mcmm/utils";
import {
  JobRequestType,
  platformManager,
  WOERKER_EXPORT_REQUEST_RETRY_COUNT,
  WORKER_EXPORT_REQUEST_THROTTLE_INTERVAL,
} from "~/data";
import { PlatformPlugin } from "@mcmm/platform";

import { MessageType, JobType } from "../types";
import { JobHandler } from "./job-handler";

import type { ModpackExportParams, PlatformPluginTypes } from "@mcmm/platform";
import type { ApiResponse } from "@mcmm/api";
import type {
  GameVersion,
  ModLoader,
  PackSupportMeta,
  Platform,
  PlatformModMetadata,
} from "@mcmm/data";
import type * as Worker from "../types";

//================================================

const makeFetcher = async function* makeFetcher<T extends Platform>(
  platform: T,
  mods: PlatformModMetadata<T, PlatformPluginTypes[T]["id"]>[],
  gameVersion: GameVersion,
  loader: ModLoader,
  onProgress: (i: number, total: number) => void,
  retryCount: number,
  missingModIds: PlatformPluginTypes[T]["id"][],
) {
  type ModId = PlatformPluginTypes[T]["id"];
  type ModMeta = Pick<PlatformModMetadata<T, ModId>, "id" | "modName">;
  // track fetched ids to avoid repeats or circular dependencies
  const fetchedModIds = new Set<ModId>();

  // track number of retries for each mod id
  const retriedModIds = new Map<ModId, number>();

  const isExpectedError = (error: any, missingModIds: ModId[], mod?: ModMeta) => {
    if (mod) {
      error.data = { modId: mod.id };
      if (mod.modName) {
        error.message = error.message.replace(mod.id, mod.modName);
      }
    }
    return (
      error?.code === PlatformPlugin.NO_FILE_FOR_MOD_VERSION_ERROR_CODE &&
      missingModIds.includes(mod?.id ?? error?.data?.modId)
    );
  };

  // handler for when a request returns an error
  const onError = (mod: ModMeta, queue: ModMeta[], error: any) => {
    if (isExpectedError(error, missingModIds, mod)) {
      error.data = { modId: mod.id };
      return;
    }
    // if retries are enabled and we haven't hit the limit for this mod yet
    if (retryCount > 0 && (retriedModIds.get(mod.id) ?? 0) < retryCount) {
      // add it back to the queue
      retriedModIds.set(mod.id, (retriedModIds.get(mod.id) ?? 0) + 1);
      queue.push(mod);
    } else {
      return Promise.resolve({ data: null, error });
    }
  };

  const checkPromisesForErrors = async (promises: Promise<ApiResponse<any>>[]) => {
    const results = await Promise.allSettled(promises);
    const errorResponse = results.find(
      r =>
        (r.status === "rejected" && !isExpectedError(r.reason, missingModIds)) ||
        (r.status === "fulfilled" &&
          r.value.error &&
          !isExpectedError(r.value.error, missingModIds)),
    );
    if (errorResponse) {
      return Promise.resolve({
        data: null,
        error:
          errorResponse.status === "rejected"
            ? createDisplayableError(errorResponse.reason)
            : errorResponse.value.error,
      });
    }
  };

  const modsCopy = mods.slice();

  // build unique set of dependency mod ids to fetch
  const dependencyModIdsRaw = new Set<ModId>();

  const onMainFilesProgress = (i: number, total: number) =>
    // inflate the total a bit since the number of dependencies isn't known yet, so the progress bar
    // fills at a natural-looking rate
    onProgress(i, Math.max(total + Math.ceil(0.5 * (total - i)), total + dependencyModIdsRaw.size));
  const mainFilesPromises: Promise<ApiResponse<any>>[] = [];

  for (let i = 0; i < modsCopy.length; i++) {
    onMainFilesProgress(i, modsCopy.length);
    const mod = modsCopy[i];
    const promise = platformManager
      .getLatestModFileForPlatform(platform, mod.id, gameVersion, loader)
      .then(response => {
        if (response.error) {
          onError(mod, modsCopy, response.error);
        } else if (response.data) {
          fetchedModIds.add(mod.id);
          platformManager
            .getDependencyModIdsFromFile(platform, response.data)
            .forEach(id => dependencyModIdsRaw.add(id));
        }
        return response;
      })
      .catch(error => onError(mod, modsCopy, error) ?? { data: null, error });
    mainFilesPromises.push(promise);
    yield promise;

    // if we're at the last mod, wait for all requests to finish so we can get all dependencies
    // before proceeding
    if (i === modsCopy.length - 1) {
      const result = await checkPromisesForErrors(mainFilesPromises);
      if (result?.error) {
        return Promise.reject(result.error);
      }
    }
  }

  onMainFilesProgress(mods.length, mods.length);

  const dependencyMods = Array.from(dependencyModIdsRaw).map(
    (id): ModMeta => ({ id, modName: "" }),
  );
  const depFilesPromises: Promise<any>[] = [];

  for (let i = 0; i < dependencyMods.length; i++) {
    const mod = dependencyMods[i];
    // skip repeats
    if (fetchedModIds.has(mod.id)) {
      continue;
    }
    onProgress(mods.length + i, dependencyMods.length + mods.length);
    const promise = platformManager
      .getLatestModFileForPlatform(platform, mod.id, gameVersion, loader)
      .then(response => {
        if (response.error) {
          onError(mod, dependencyMods, response.error);
        } else if (response.data) {
          fetchedModIds.add(mod.id);
          dependencyMods.push(
            ...platformManager
              .getDependencyModIdsFromFile(platform, response.data)
              .map(id => ({ id, modName: "" })),
          );
        }
        return response;
      });
    depFilesPromises.push(promise);
    yield promise;
  }

  const result = await checkPromisesForErrors(depFilesPromises);
  if (result?.error) {
    return Promise.reject(result.error);
  }
  onProgress(dependencyMods.length, dependencyMods.length);
};

//================================================

export class ExportJobHandler extends JobHandler<Worker.ExportJobState> {
  public readonly type = JobType.Export;

  static readonly requestRetryCount: number = WOERKER_EXPORT_REQUEST_RETRY_COUNT;
  static readonly fetchInterval: number = WORKER_EXPORT_REQUEST_THROTTLE_INTERVAL;

  static get variableFetchInterval() {
    return getVariableInterval(this.fetchInterval);
  }

  //================================================

  public createJob = async (args: Worker.ExportJob): Promise<Worker.ExportJobState | undefined> => {
    this.debugLog("Creating export job for", args);
    if (
      !args.packSupportMeta.supportedMods.length &&
      !args.packSupportMeta.supportedAlternativeMods.length
    ) {
      this.debugLog("This pack has no supported mods, aborting...");
      return;
    }

    const mods = ExportJobHandler.getModsFromSupportMeta(args.packSupportMeta, args.platform);
    const missingModIds = args.packSupportMeta.supportedMods
      .concat(args.packSupportMeta.supportedAlternativeMods)
      .filter(
        m =>
          !m.versions.find(
            v =>
              v.platform === args.platform &&
              v.gameVersion === args.packSupportMeta.gameVersion &&
              v.loader === args.packSupportMeta.loader,
          ),
      )
      .map(m => m.platforms.find(m => m.platform === args.platform)?.id)
      .filter(m => m != null);

    const state: Worker.ExportJobState = {
      job: args,
      type: JobType.Export,
      paused: false,
      cancelled: false,
      // @ts-expect-error: fetcher will be assigned momentarily
      data: {
        current: 0,
        total: mods.length,
        modIds: mods.map(mod => mod.id),
        done: false,
        files: [],
      },
    };
    const onProgress = (current: number, total: number) => {
      state.data.current = current;
      state.data.total = total;
      this.onProgress(state);
    };
    state.data.fetcher = makeFetcher(
      args.platform,
      mods,
      args.packSupportMeta.gameVersion,
      args.packSupportMeta.loader,
      onProgress,
      ExportJobHandler.requestRetryCount,
      missingModIds,
    );

    return state;
  };

  //================================================

  public async executeJobStep(state: Worker.ExportJobState): Promise<boolean> {
    return state.data.fetcher
      .next()
      .then(({ value, done }) => {
        if (value?.data) {
          state.data.files.push(value.data);
        }
        state.data.done = !!done;
        return new Promise<boolean>(resolve =>
          setTimeout(() => resolve(!!done), ExportJobHandler.variableFetchInterval),
        );
      })
      .catch(error => {
        state.error = error;
        state.failed = true;
        return true;
      });
  }

  isJobComplete(job: Worker.ExportJobState): boolean {
    return job.data.done;
  }

  //================================================

  public scheduleAutoJobs(onTimeout: (job: Worker.ExportJobState) => void) {}

  //================================================

  isSubsetOfExistingJob(request: Worker.ExportJob, existingJob: Worker.ExportJobState): boolean {
    return this.matchesExistingJob(
      { ...request, jobType: JobType.Export, type: JobRequestType.StartJob },
      existingJob,
    );
  }

  isSupersetOfExistingJob(request: Worker.ExportJob, existingJob: Worker.ExportJobState): boolean {
    return this.matchesExistingJob(
      { ...request, jobType: JobType.Export, type: JobRequestType.StartJob },
      existingJob,
    );
  }

  matchesExistingJob(
    request: Worker.JobRequest & {
      jobType: Worker.ExportJobState["type"];
    },
    existingJob: Worker.ExportJobState,
  ): boolean {
    return (
      ExportJobHandler.getJobId(existingJob) ===
      (request.type === JobRequestType.StartJob
        ? ExportJobHandler.getJobIdFromRequest(request)
        : request.id)
    );
  }

  //================================================

  private static getModsFromSupportMeta = <P extends Platform>(
    packSupportMeta: PackSupportMeta,
    platform: P,
  ) =>
    Array.from(
      new Set(
        packSupportMeta.supportedMods
          .concat(packSupportMeta.supportedAlternativeMods)
          .map(mod => mod.platforms.find(m => m.platform === platform))
          .filter((mod): mod is PlatformModMetadata<P, PlatformPluginTypes[P]["id"]> => !!mod),
      ),
    );

  private static getJobId = (
    state: Pick<Worker.ExportJobState, "job"> & {
      data: Pick<Worker.ExportJobStateData, "modIds">;
    },
  ) =>
    [
      state.job.platform,
      state.job.packSupportMeta.pack.id,
      state.job.packSupportMeta.gameVersion,
      state.job.packSupportMeta.loader,
      state.job.version,
      state.job.modLoaderVersion,
      state.job.author,
      state.data.modIds.join(),
    ].join();

  public static getJobIdFromRequest = (request: ModpackExportParams) => {
    return ExportJobHandler.getJobId({
      job: request,
      data: {
        modIds: this.getModsFromSupportMeta(request.packSupportMeta, request.platform).map(
          mod => mod.id,
        ),
      },
    });
  };

  public static getJobName = (
    job: Pick<ModpackExportParams, "packSupportMeta" | "version" | "platform">,
  ) => {
    const { packSupportMeta: meta } = job;
    return `${meta.pack.name} v${job.version} (${capitalize(meta.loader)} ${meta.gameVersion}) (${job.platform})`;
  };

  public onStart(state: Worker.ExportJobState) {
    JobHandler.sendMessage({
      type: MessageType.Progress,
      jobType: JobType.Export,
      message: `${state.paused ? "Resuming" : "Starting"} background export job for ${ExportJobHandler.getJobName(state.job)})...`,
      total: state.data.total,
      current: state.data.current,
      id: ExportJobHandler.getJobId(state),
    });
  }

  public onPause(state: Worker.ExportJobState) {
    JobHandler.sendMessage({
      type: MessageType.Pause,
      jobType: JobType.Export,
      message: `Pausing background export job for ${ExportJobHandler.getJobName(state.job)}...`,
      id: ExportJobHandler.getJobId(state),
    });
  }

  public onCancel(state: Worker.ExportJobState) {
    JobHandler.sendMessage({
      type: MessageType.Cancel,
      jobType: JobType.Export,
      message: `Cancelling background export job for ${ExportJobHandler.getJobName(state.job)}.`,
      id: ExportJobHandler.getJobId(state),
    });
  }

  public onComplete(state: Worker.ExportJobState) {
    JobHandler.sendMessage({
      type: MessageType.Complete,
      jobType: JobType.Export,
      id: ExportJobHandler.getJobId(state),
      total: state.data.total,
      message: `Completed background export job for ${ExportJobHandler.getJobName(state.job)}`,
      files: state.data.files,
    });
  }

  public onReject(request: Worker.ExportStartRequest) {
    JobHandler.sendMessage({
      type: MessageType.Cancel,
      jobType: JobType.Export,
      id: ExportJobHandler.getJobIdFromRequest(request),
      message: `Rejecting background export job for ${ExportJobHandler.getJobName(request)} (already in queue)`,
    });
  }

  public onError(state: Worker.ExportJobState) {
    JobHandler.sendMessage({
      type: MessageType.Error,
      jobType: JobType.Export,
      message: state.error?.message,
      name: ExportJobHandler.getJobName(state.job),
      id: ExportJobHandler.getJobId(state),
    });
  }

  private onProgress = (
    state: Pick<Worker.ExportJobState, "job"> & {
      data: Pick<Worker.ExportJobStateData, "modIds" | "current" | "total">;
    },
  ) =>
    JobHandler.sendMessage({
      type: MessageType.Progress,
      jobType: JobType.Export,
      id: ExportJobHandler.getJobId(state),
      current: state.data.current,
      total: state.data.total,
    });
}
