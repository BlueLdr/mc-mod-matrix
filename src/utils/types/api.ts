import type { DisplayableError } from "~/utils";

export interface RequestStatus {
  pending: boolean;
  success: boolean;
  error?: DisplayableError;
}
