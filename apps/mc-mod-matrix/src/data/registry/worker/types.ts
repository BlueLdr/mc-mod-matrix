import type { GameVersion, Mod } from "@mcmm/data";

//================================================

export interface WorkerInitRequest {
  type: "init";
  modsToAutoRefresh?: Mod["id"][];
}

export interface WorkerUpdateCommonModsRequest {
  type: "update-common-mods";
  modsToAutoRefresh: Mod["id"][];
}

export interface WorkerBackgroundRefreshProgressMessage {
  type: "progress";
  total: number;
  current?: { index: number; name: string };
  packId?: string;
}

export interface WorkerBackgroundRefreshCompleteMessage {
  type: "complete";
  total: number;
  packId?: string;
}

export interface WorkerBackgroundRefreshPausedMessage {
  type: "pause";
  packId?: string;
}

export interface WorkerBackgroundRefreshFailedMessage {
  type: "error";
  packId?: string;
}

export interface WorkerBackgroundRefreshCancelledMessage {
  type: "cancel";
  packId?: string;
}

export interface WorkerBackgroundRefreshStartRequest {
  type: "start-refresh";
  packId: string;
  mods: Mod["id"][];
  minVersion: GameVersion;
  runImmediately?: boolean;
  forceUpdate?: boolean;
}

type WithMessage = {
  message?: string;
};

export type WorkerRequest =
  | WorkerInitRequest
  | WorkerBackgroundRefreshStartRequest
  | WorkerUpdateCommonModsRequest;
export type WorkerMessage = WithMessage &
  (
    | WorkerBackgroundRefreshProgressMessage
    | WorkerBackgroundRefreshPausedMessage
    | WorkerBackgroundRefreshCompleteMessage
    | WorkerBackgroundRefreshFailedMessage
    | WorkerBackgroundRefreshCancelledMessage
  );

//================================================

export interface WorkerBackgroundRefreshPackJob {
  packId: string;
  mods: Mod["id"][];
  minVersion: GameVersion;
  forceUpdate?: boolean;
}

export interface WorkerBackgroundRefreshAutoJob {
  packId?: never;
  mods: Mod["id"][];
  minVersion?: never;
  forceUpdate?: boolean;
}

export type WorkerBackgroundRefreshJob =
  | WorkerBackgroundRefreshPackJob
  | WorkerBackgroundRefreshAutoJob;

export interface WorkerBackgroundRefreshState {
  job: WorkerBackgroundRefreshJob;
  total: number;
  modsRemaining: Mod[];
  paused?: boolean;
  cancelled?: boolean;
}
