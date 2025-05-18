import type { DisplayableError } from "~/utils";

//================================================

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
