import type { DisplayableError } from "@mcmm/types";

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

export interface RequestStatus {
  pending: boolean;
  success: boolean;
  error?: DisplayableError;
}
