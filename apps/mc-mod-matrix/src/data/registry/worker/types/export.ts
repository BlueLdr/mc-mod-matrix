import type { ApiResponse } from "@mcmm/api";
import type { Platform } from "@mcmm/data";
import type { ModpackExportParams, PlatformPluginTypes } from "@mcmm/platform";
import type {
  JobCommonState,
  JobCancelRequestBase,
  JobPauseRequestBase,
  JobResumeRequestBase,
  JobStartRequestBase,
  Message,
  CompleteMessage,
  ProgressMessage,
  JobType,
  MessageType,
} from "./base";

//================================================

export interface ExportStartRequest
  extends JobStartRequestBase<JobType.Export>,
    ModpackExportParams {}

export type ExportPauseRequest = JobPauseRequestBase<JobType.Export>;

export type ExportResumeRequest = JobResumeRequestBase<JobType.Export>;

export type ExportCancelRequest = JobCancelRequestBase<JobType.Export>;

export type ExportJobRequest =
  | ExportStartRequest
  | ExportPauseRequest
  | ExportResumeRequest
  | ExportCancelRequest;

//================================================

export interface ExportJobMessageBase {
  id: string;
}

export interface ExportProgressMessage
  extends ProgressMessage<JobType.Export>,
    ExportJobMessageBase {}

export interface ExportCompleteMessage<P extends Platform = Platform>
  extends CompleteMessage<JobType.Export>,
    ExportJobMessageBase {
  files: PlatformPluginTypes[P]["file"][];
}

export interface ExportPausedMessage
  extends Message<MessageType.Pause, JobType.Export>,
    ExportJobMessageBase {}

export interface ExportFailedMessage
  extends Message<MessageType.Error, JobType.Export>,
    ExportJobMessageBase {
  name: string;
}

export interface ExportCancelledMessage
  extends Message<MessageType.Cancel, JobType.Export>,
    ExportJobMessageBase {}

export type ExportJobMessage =
  | ExportProgressMessage
  | ExportCompleteMessage
  | ExportPausedMessage
  | ExportFailedMessage
  | ExportCancelledMessage;

//================================================

export type ExportJob = ModpackExportParams;

export interface ExportJobStateData<P extends Platform = Platform> {
  total: number;
  current: number;
  modIds: PlatformPluginTypes[P]["id"][];
  done: boolean;
  files: PlatformPluginTypes[P]["file"][];
  fetcher: AsyncGenerator<ApiResponse<PlatformPluginTypes[P]["file"]>, void, never>;
}

export interface ExportJobState extends JobCommonState {
  type: JobType.Export;
  job: ExportJob;
  data: ExportJobStateData;
}
