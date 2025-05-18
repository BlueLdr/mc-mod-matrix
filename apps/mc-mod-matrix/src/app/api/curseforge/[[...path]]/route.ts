import { curseforgeApi } from "@mcmm/api";
import { shouldForwardHeader } from "~/utils";

import type { NextRequest } from "next/server";

//================================================

export async function GET(request: NextRequest) {
  const path = request.nextUrl.pathname.replace(/^.*\/api\/curseforge/i, "");
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
    headers: headers,
  };
  const result = await curseforgeApi
    .fetch(path, request.nextUrl.searchParams, requestInit)
    .catch(e => {
      console.log(`Failed to call Curseforge API: `, e);
    });

  if (!result) {
    return Response.error();
  }
  return Response.json(result);
}
