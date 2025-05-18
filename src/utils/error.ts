const FALLBACK_MESSAGE = "An unknown error occurred.";

// eslint-disable-next-line @typescript-eslint/no-unsafe-declaration-merging
export interface DisplayableError {
  raw: Error | object | string;
  message: string;
  title?: string;
  code?: string | number;
  status?: number;
}

// eslint-disable-next-line @typescript-eslint/no-unsafe-declaration-merging
export class DisplayableError {
  constructor(
    error: Error | object | string,
    message: string,
    code?: string | number,
    title?: string,
    status?: number,
    statusText?: string,
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
  defaultMessage?: string,
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
  error: DisplayableError | Error | string | object,
  defaultMessage: string,
): DisplayableError => {
  if (error instanceof DisplayableError) {
    return error;
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
  response: any,
): response is Error | DisplayableError | Record<"error", any> =>
  response instanceof Error || response instanceof DisplayableError || response?.error;
