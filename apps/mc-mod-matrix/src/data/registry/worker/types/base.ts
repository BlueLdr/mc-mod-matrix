import type { BackgroundJobProgressData } from "~/data";

//================================================

export enum JobRequestType {
  StartJob = "start-job",
  PauseJob = "pause-job",
  ResumeJob = "resume-job",
  CancelJob = "cancel-job",
}

export enum JobType {
  Refresh = "refresh",
  Export = "export",
}

//================================================

export interface JobRequestBase<
  TType extends JobRequestType = JobRequestType,
  TJobType extends JobType = JobType,
> {
  type: TType;
  jobType: TJobType;
}

export interface JobStartRequestBase<TJobType extends JobType = JobType>
  extends JobRequestBase<JobRequestType.StartJob, TJobType> {
  runImmediately?: boolean;
  forceRun?: boolean;
}

export interface JobPauseRequestBase<TJobType extends JobType = JobType>
  extends JobRequestBase<JobRequestType.PauseJob, TJobType> {
  id: string;
}

export interface JobResumeRequestBase<TJobType extends JobType = JobType>
  extends JobRequestBase<JobRequestType.ResumeJob, TJobType> {
  id: string;
}

export interface JobCancelRequestBase<TJobType extends JobType = JobType>
  extends JobRequestBase<JobRequestType.CancelJob, TJobType> {
  id: string;
}

//================================================

export enum MessageType {
  Progress = "progress",
  Pause = "pause",
  Cancel = "cancel",
  Complete = "complete",
  Error = "error",
}

export interface Message<
  TType extends MessageType = MessageType,
  TJobType extends JobType = JobType,
> {
  type: TType;
  jobType: TJobType;
  message?: string;
}

export interface ProgressMessage<TJobType extends JobType = JobType>
  extends Message<MessageType.Progress, TJobType>,
    Pick<BackgroundJobProgressData, "current" | "total" | "currentName"> {}

export interface CompleteMessage<TJobType extends JobType = JobType>
  extends Message<MessageType.Complete, TJobType>,
    Pick<BackgroundJobProgressData, "total"> {}

//================================================

export interface JobCommonState {
  type: string;
  job: unknown;
  data: unknown;
  paused?: boolean;
  cancelled?: boolean;
  failed?: boolean;
  error?: Error;
}
