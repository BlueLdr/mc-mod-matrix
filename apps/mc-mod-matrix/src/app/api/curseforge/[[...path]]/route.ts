import { shouldForwardHeader } from "~/utils";

import type { NextRequest } from "next/server";

//================================================

const CURSEFORGE_BASE_URL = process.env.MCMM_CURSEFORGE_API_URL ?? "https://api.curseforge.com";
const CURSEFORGE_REGULAR_API_URL = "https://www.curseforge.com/api";
const CURSEFORGE_API_KEY = process.env.MCMM_CURSEFORGE_API_KEY ?? "";

export async function GET(request: NextRequest) {
  const path = request.nextUrl.pathname.replace(/^.*\/api\/curseforge/i, "");
  const isSearch = path.endsWith("mods/search");
  const url = new URL(
    isSearch ? "/api/v1/mods/search" : path,
    isSearch ? CURSEFORGE_REGULAR_API_URL : CURSEFORGE_BASE_URL,
  );
  url.search = request.nextUrl.searchParams?.toString() ?? "";

  const headers = Array.from(request.headers.entries()).reduce(
    (obj, [key, value]) => {
      if (shouldForwardHeader(key)) {
        obj[key] = value;
      }
      return obj;
    },
    {} as Record<string, string>,
  );
  const requestInit: RequestInit = {
    body: request.body,
    headers: {
      ...headers,
      "x-api-key": CURSEFORGE_API_KEY,
      "Accept-Encoding": "utf-8",
    },
  };

  return fetch(url, requestInit)
    .then(async response => {
      if (response.ok) {
        try {
          return Response.json(await response.json());
        } catch (e) {
          return Response.json(e, { status: 500 });
        }
      } else {
        return response;
      }
    })
    .catch(error => {
      console.error(`error: `, error);
      return Response.json(error, { status: 500 });
    });
}
