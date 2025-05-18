import type { NextRequest } from "next/server";

//================================================

export const dynamic = "force-static";

export async function GET(request: NextRequest) {
  const url = decodeURIComponent(request.nextUrl.pathname.replace("/api/image/", ""));
  if (!url) {
    return Response.json("Missing required query param `url`", { status: 400 });
  }

  return fetch(url);
}
