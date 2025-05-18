import { ApiConnector } from "./abstract-api";

//================================================

export const CURSEFORGE_BASE_URL =
  process.env.MCMM_CURSEFORGE_API_URL ?? "https://api.curseforge.com";

export class CurseforgeServerApi extends ApiConnector {
  protected baseUrl = CURSEFORGE_BASE_URL;

  protected override getHeaders(): RequestInit["headers"] {
    return {
      ...super.getHeaders(),
      "x-api-key": process.env.MCMM_CURSEFORGE_API_KEY ?? "",
    };
  }
}

export const curseforgeServerApi = new CurseforgeServerApi();
