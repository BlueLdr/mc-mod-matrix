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
    this.message = `${message || FALLBACK_MESSAGE}`;
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

const isPotentialMessage = (value: any) =>
  typeof value === "string" && value.trim().includes(" ") && value.trim() !== "";
const isPotentialCode = (value: any) =>
  (typeof value === "string" && !value.trim().includes(" ") && value.trim() !== "") ||
  typeof value === "number";

const getAnyMatchingProp = (
  obj: any,
  props: string[],
  predicate: (value: any) => boolean,
  asString?: boolean,
) => {
  if (!obj || !props.length) {
    return undefined;
  }
  const match = props.find(prop => predicate(obj[prop]));
  return match ? (asString ? `${obj[match]}` : obj[match]) : undefined;
};

export type ErrorMeta = {
  message: string;
  code?: string | number;
  title?: string;
};

export const getErrorMetaFromUnknownData = (
  data: any,
  defaultMessage: string,
  depth = 0,
): ErrorMeta | DisplayableError => {
  if (data instanceof DisplayableError) {
    return data as DisplayableError;
  }
  if (data?.error instanceof DisplayableError) {
    return data.error as DisplayableError;
  }
  if (!data || depth >= 3) {
    return { message: defaultMessage };
  }

  if (isPotentialMessage(data)) {
    return { message: data };
  }
  if (isPotentialCode(data)) {
    return { message: defaultMessage, code: data };
  }

  const output: ErrorMeta = {
    message: "",
    code: getAnyMatchingProp(
      data,
      ["code", "error", "errorCode", "status", "statusCode"],
      isPotentialCode,
    ),
    title: getAnyMatchingProp(data, ["title", "name"], isPotentialMessage),
  };

  const potentialMessage = getAnyMatchingProp(data, ["message", "detail"], isPotentialMessage);
  if (potentialMessage) {
    const errorProp = getAnyMatchingProp(data, ["error"], isPotentialMessage);
    if (errorProp && errorProp !== potentialMessage) {
      output.title = errorProp;
    }
    output.message = potentialMessage;
  }

  if (output.message && output.title) {
    return output;
  }

  let nestedError = undefined;
  if (Array.isArray(data["errors"]) && data["errors"].length) {
    nestedError = data["errors"][0];
    if (nestedError && typeof nestedError === "string") {
      output.title = output.message;
      output.message = nestedError;
      nestedError = undefined;
    }
  }
  if (output.message && output.title) {
    return output;
  }

  if (data["error"] && typeof data["error"] === "object") {
    nestedError = data["error"];
  }
  if (nestedError) {
    const nested = getErrorMetaFromUnknownData(nestedError, defaultMessage, depth + 1);
    if (nested instanceof DisplayableError) {
      return nestedError as DisplayableError;
    }
    if (output.message && !output.title && nested.message && !nested.title) {
      output.title = output.message;
    }
    output.title = output.title || nested.title;
    output.code = output.code || nested.code;
    output.message = nested.message;
  }

  return output;
};

export const createDisplayableError = (
  data: any,
  defaultMessage = "Something went wrong",
  response?: Response,
) => {
  if (data instanceof DisplayableError) {
    return data;
  }
  if (data instanceof Error) {
    return new DisplayableError(
      data,
      data.message,
      getAnyMatchingProp(data, ["code", "errorCode"], isPotentialCode),
      getAnyMatchingProp(data, ["title", "name"], isPotentialMessage),
      response?.status,
      response?.statusText,
    );
  }

  let error = data,
    message = defaultMessage,
    code = undefined,
    title = undefined;
  if (typeof data === "string") {
    error = new Error(data);
    message = data;
  } else if (!!data && typeof data === "object") {
    const item = Array.isArray(data) ? data[0] : data;
    const meta = getErrorMetaFromUnknownData(item, defaultMessage);
    if (meta instanceof DisplayableError) {
      return meta;
    }
    message = meta.message || message;
    code = meta.code;
    title = meta.title;
  } else {
    error = new Error(message);
  }

  return new DisplayableError(error, message, code, title, response?.status, response?.statusText);
};

export const isErrorResponse = (
  response: any,
): response is Error | DisplayableError | Record<"error", any> =>
  response instanceof Error || response instanceof DisplayableError || response?.error;
