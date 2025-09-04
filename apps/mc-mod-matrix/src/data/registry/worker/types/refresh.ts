import type {
  CompleteMessage,
  Message,
  ProgressMessage,
  JobType,
  MessageType,
  JobCommonState,
  JobPauseRequestBase,
  JobStartRequestBase,
  JobResumeRequestBase,
  JobCancelRequestBase,
} from "./base";
import type { GameVersion, Mod } from "@mcmm/data";

//================================================

interface RefreshJobRequestBase {
  packId: string;
}

export interface RefreshStartRequest
  extends JobStartRequestBase<JobType.Refresh>,
    RefreshJobRequestBase {
  mods: Mod["id"][];
  minVersion: GameVersion;
}

export interface RefreshPauseRequest
  extends JobPauseRequestBase<JobType.Refresh>,
    RefreshJobRequestBase {}

export interface RefreshResumeRequest
  extends JobResumeRequestBase<JobType.Refresh>,
    RefreshJobRequestBase {}

export interface RefreshCancelRequest
  extends JobCancelRequestBase<JobType.Refresh>,
    RefreshJobRequestBase {}

export type RefreshJobRequest =
  | RefreshStartRequest
  | RefreshPauseRequest
  | RefreshResumeRequest
  | RefreshCancelRequest;

//================================================

export interface RefreshJobMessageBase {
  id: string;
}

export interface RefreshProgressMessage
  extends ProgressMessage<JobType.Refresh>,
    RefreshJobMessageBase {}

export interface RefreshCompleteMessage
  extends CompleteMessage<JobType.Refresh>,
    RefreshJobMessageBase {}

export interface RefreshPausedMessage
  extends Message<MessageType.Pause, JobType.Refresh>,
    RefreshJobMessageBase {}

export interface RefreshFailedMessage
  extends Message<MessageType.Error, JobType.Refresh>,
    RefreshJobMessageBase {}

export interface RefreshCancelledMessage
  extends Message<MessageType.Cancel, JobType.Refresh>,
    RefreshJobMessageBase {}

export type RefreshJobMessage =
  | RefreshProgressMessage
  | RefreshCompleteMessage
  | RefreshPausedMessage
  | RefreshFailedMessage
  | RefreshCancelledMessage;

//================================================

export interface RefreshPackJob {
  packId: string;
  mods: Mod["id"][];
  minVersion: GameVersion;
  forceRun?: boolean;
}

export interface RefreshAutoJob {
  packId?: never;
  mods: Mod["id"][];
  minVersion?: never;
  forceRun?: boolean;
}

export type RefreshJob = RefreshPackJob | RefreshAutoJob;

export interface RefreshJobStateData {
  total: number;
  modsRemaining: Mod[];
}

export interface RefreshJobState extends JobCommonState {
  type: JobType.Refresh;
  job: RefreshJob;
  data: RefreshJobStateData;
}
