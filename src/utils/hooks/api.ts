import { useCallback, useRef, useState } from "react";

import { createDisplayableError, useValueRef } from "~/utils";

import type { ApiResponse, ApiErrorResponse } from "~/api";
import type { RequestStatus } from "~/utils";

export const useApiRequest = <Args extends any[], D>(
  makeApiCall: (...args: Args) => Promise<ApiResponse<D>>,
  keepDataDuringRefetch?: boolean,
  fallbackErrorText?: string
): readonly [
  (...args: Args) => Promise<ApiResponse<D>>,
  D | undefined,
  RequestStatus,
  (reset?: boolean) => void
] => {
  const [state, setState] = useState<RequestStatus>({
    pending: false,
    success: false,
    error: undefined,
  });
  const [data, setData] = useState<D | undefined>(undefined);
  const isCancelled = useRef<{ current: boolean } | undefined>(undefined);

  const stateRef = useValueRef(state);
  const sendRequest = useCallback(
    (...args: Args) => {
      const cancelled = { current: false };
      if (stateRef.current.pending && isCancelled.current) {
        isCancelled.current.current = true;
      }
      isCancelled.current = cancelled;
      setState({ pending: true, success: false, error: undefined });
      if (!keepDataDuringRefetch) {
        setData(undefined);
      }
      return makeApiCall(...args)
        .then(response => {
          if (cancelled.current) {
            return new Promise<ApiResponse<D>>(() => {});
          }
          if (isCancelled.current === cancelled) {
            isCancelled.current = undefined;
          }
          if (!response.error) {
            setData(response.data);
          }
          setState({
            pending: false,
            success: !response.error,
            error: response.error
              ? createDisplayableError(response.error, fallbackErrorText ?? "")
              : undefined,
          });
          return response;
        })
        .catch(error => {
          if (cancelled.current) {
            return new Promise<ApiResponse<D>>(() => {});
          }
          if (isCancelled.current === cancelled) {
            isCancelled.current = undefined;
          }
          const errorMsg = createDisplayableError(
            error,
            fallbackErrorText ?? ""
          );
          setState({
            pending: false,
            success: false,
            error: errorMsg,
          });
          return {
            data: undefined,
            error: errorMsg,
            axiosResponse: null,
          } as ApiErrorResponse;
        });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [makeApiCall, keepDataDuringRefetch]
  );

  const cancelRequest = useCallback((reset?: boolean) => {
    if (isCancelled.current) {
      isCancelled.current.current = true;
    }
    if (reset) {
      setState({
        pending: false,
        success: false,
        error: undefined,
      });
    }
  }, []);

  return [sendRequest, data, state, cancelRequest] as const;
};
