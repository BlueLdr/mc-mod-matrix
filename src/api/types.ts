import type { DisplayableError } from "~/utils";

export interface ApiErrorResponse {
  data?: null;
  error: DisplayableError;
  // meta?: undefined;
}
export interface ApiSuccessResponse<R> {
  data: R;
  error?: null;
  // meta?: ApiResponseMeta;
}

export type ApiResponse<R> = ApiSuccessResponse<R> | ApiErrorResponse;

export interface CurseforgeModDataRaw {
  id: number;
  slug: string;
  author: { name: string; username: string; id: number };
  name: string;
  summary: string;
  thumbnailUrl: string;
}

export interface ModrinthModDataRaw {
  project_id: string;
  slug: string;
  author: string;
  title: string;
  description: string;
  icon_url: string;
}

export interface ModMetadata {
  slug: string;
  name: string;
  image: string;
  curseforge?: CurseforgeModDataRaw;
  modrinth?: ModrinthModDataRaw;
}
