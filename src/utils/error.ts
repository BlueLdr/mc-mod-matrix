import type { AxiosError } from "axios";

const FALLBACK_MESSAGE = "An unknown error occurred.";

export interface DisplayableError {
  raw: Error | object | string;
  message: string;
  title?: string;
  code?: string | number;
  status?: number;
}

export class DisplayableError {
  constructor(
    error: Error | object | string,
    message: string,
    code?: string | number,
    title?: string,
    status?: number,
    statusText?: string
  ) {
    this.raw = error;
    this.title = `${title ?? (error as any)?.title ?? ""}`;
    this.message = `${message || getErrorMessage(error, FALLBACK_MESSAGE)}`;
    this.code = code ?? (error as any)?.code;
    this.status = status ?? (error as any)?.status;
    this.statusText = statusText ?? (error as any)?.statusText;
  }

  raw: Error | object | string;
  message: string;
  code?: string | number;
  title?: string;
  status?: number;
  statusText?: string;
}

export const getErrorMessage = (
  error: DisplayableError | Error | object | string,
  defaultMessage?: string
): string | undefined => {
  if (typeof error === "string") {
    return error;
  }
  const err: any = error;
  if (err?.title && err?.status) {
    return `${err.title} (${err.status})`;
  }
  if (typeof err?.message === "string") {
    return err.message;
  }
  return defaultMessage;
};

export const createDisplayableError = (
  error: DisplayableError | Error | AxiosError | string | object,
  defaultMessage: string
): DisplayableError => {
  if (error instanceof DisplayableError) {
    return error;
  }
  if ((error as any)?.isAxiosError) {
    return new DisplayableError(
      error,
      typeof (error as AxiosError)?.response?.data === "string"
        ? ((error as AxiosError)?.response?.data as string)
        : "",
      undefined,
      (error as any)?.message,
      (error as AxiosError)?.response?.status,
      (error as AxiosError)?.response?.statusText
    );
  }
  const errorProp = (error as any).error;
  if (errorProp != null) {
    if (errorProp instanceof DisplayableError) {
      return errorProp;
    }
    error = errorProp;
  }
  const message = getErrorMessage(error, defaultMessage);
  // @ts-expect-error: message will always be string since we provided a default
  return new DisplayableError(error, message);
};

export const isErrorResponse = (
  response: any
): response is Error | DisplayableError | Record<"error", any> =>
  response instanceof Error ||
  response instanceof DisplayableError ||
  response?.error;
