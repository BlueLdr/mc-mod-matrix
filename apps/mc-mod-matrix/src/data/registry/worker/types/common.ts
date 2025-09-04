import type { GameVersion, Mod } from "@mcmm/data";
import type { JobType, MessageType, JobRequestType } from "./base";
import type { ExportJob, ExportJobState, ExportJobRequest, ExportJobMessage } from "./export";
import type { RefreshJob, RefreshJobMessage, RefreshJobRequest, RefreshJobState } from "./refresh";

//================================================

export interface InitRequest {
  type: "init";
  modsToAutoRefresh?: Mod["id"][];
  allGameVersions?: GameVersion[];
}

export interface SetGameVersionsRequest {
  type: "set-game-versions";
  allGameVersions: GameVersion[];
}

export interface UpdateCommonModsRequest {
  type: "update-common-mods";
  modsToAutoRefresh: Mod["id"][];
}

//================================================

export type Job = RefreshJob | ExportJob;
export type JobState = RefreshJobState | ExportJobState;

export type JobStateForType<T extends JobType> = JobState & { type: T };

//================================================

export type JobRequest = RefreshJobRequest | ExportJobRequest;

export type JobRequestWith<
  TType extends JobRequestType = JobRequestType,
  TJobType extends JobType = JobType,
> = JobRequest & {
  type: TType;
  jobType: TJobType;
};

export type JobStartRequest<TJobType extends JobType> = JobRequestWith<
  JobRequestType.StartJob,
  TJobType
>;

export type Request = InitRequest | SetGameVersionsRequest | UpdateCommonModsRequest | JobRequest;

//================================================

export type JobMessage = RefreshJobMessage | ExportJobMessage;

export type JobMessageWith<
  TType extends MessageType = MessageType,
  TJobType extends JobType = JobType,
> = JobMessage & {
  type: TType;
  jobType: TJobType;
};
