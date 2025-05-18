export abstract class ApiConnector {
  protected abstract baseUrl: string;

  protected getHeaders(): RequestInit["headers"] {
    return {
      "Content-Type": "application/json",
      Accept: "application/json",
    };
  }

  public fetch(path: string, params?: URLSearchParams, request?: RequestInit) {
    const url = new URL(
      `${this.baseUrl}${path.startsWith("/") || this.baseUrl.endsWith("/") ? "" : "/"}${path}`,
    );
    url.search = params?.toString() ?? "";
    return fetch(url, {
      ...request,
      headers: {
        ...this.getHeaders(),
        ...request?.headers,
      },
    }).then(response => response.json());
  }
}
