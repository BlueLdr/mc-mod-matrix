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

  public fetch(path: string, params?: URLSearchParams, request?: RequestInit) {
    console.log(`path: `, path);
    const isCustomUrl = path.startsWith("https");
    const url = isCustomUrl ? new URL(path) : new URL(this.joinUrl(this.baseUrl, path));
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
