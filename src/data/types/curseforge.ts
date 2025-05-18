import type { GameVersion } from "~/data";

//================================================

export enum CurseforgeModStatus {
  Processing = 1,
  ChangesRequired,
  UnderReview,
  Approved,
  Rejected,
  MalwareDetected,
  Deleted,
  Archived,
  Testing,
  Released,
  ReadyForReview,
  Deprecated,
  Baking,
  AwaitingPublishing,
  FailedPublishing,
  Cooking,
  Cooked,
  UnderManualReview,
  ScanningForMalware,
  ProcessingFile,
  PendingRelease,
  ReadyForCooking,
  PostProcessing,
}

export interface CurseforgeModVersionDataRaw {
  id: number;
  modId: number;
  displayName: string;
  fileStatus: CurseforgeModStatus;
  isAvailable: boolean;
  gameVersions: GameVersion[];
  // loaders: ModLoader[];
}

export interface CurseforgeModMetadataRaw {
  id: number;
  slug: string;
  author: { name: string; username: string; id: number };
  name: string;
  summary: string;
  thumbnailUrl: string;
}
