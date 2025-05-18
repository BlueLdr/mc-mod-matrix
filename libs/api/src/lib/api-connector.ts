import { DisplayableError, createDisplayableError, getErrorMetaFromUnknownData } from "@mcmm/types";

import type { ApiResponse } from "./types";

//================================================

export abstract class ApiConnector {
  protected abstract baseUrl: string;

  protected joinUrl(...strings: string[]) {
    return strings.join("/").replace(/([^:])\/\/+/, "$1/");
  }

  protected getHeaders(): RequestInit["headers"] {
    return {
      "Content-Type": "application/json",
      Accept: "application/json",
    };
  }

  public fetch<T>(
    path: string,
    params?: URLSearchParams,
    request?: RequestInit,
  ): Promise<ApiResponse<T>> {
    console.log(`path: `, path);
    const isCustomUrl = path.startsWith("https");
    const url = isCustomUrl ? new URL(path) : new URL(this.joinUrl(this.baseUrl, path));
    url.search = params?.size ? params.toString() : "";
    return fetch(url, {
      ...request,
      headers: {
        ...this.getHeaders(),
        ...request?.headers,
      },
    })
      .then(async response => {
        const data = await response.json();
        if (response.status >= 400) {
          return {
            data: undefined,
            error: createDisplayableError(data, undefined, response),
          };
        } else {
          return {
            data,
            error: undefined,
          };
        }
      })
      .catch(e => {
        const errorData = getErrorMetaFromUnknownData(e, "Something went wrong");
        return {
          data: undefined,
          error: new DisplayableError(
            errorData,
            errorData.message ?? "Something went wrong",
            errorData.code,
            errorData.title,
          ),
        };
      });
  }
}
