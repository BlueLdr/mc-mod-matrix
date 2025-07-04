import { cookies } from "next/headers";

import { NAV_DRAWER_OPEN_STORAGE_KEY } from "~/utils";

//================================================

export async function POST(request: Request) {
  const body = await request.json();
  const cookieStore = await cookies();

  if (body.open == null) {
    return new Response("Missing required data `open`", {
      status: 400,
    });
  }

  cookieStore.set({
    name: NAV_DRAWER_OPEN_STORAGE_KEY,
    value: `${`${body.open}` === "true"}`,
    expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 365 * 10),
    path: "/",
  });
  return new Response(JSON.stringify({ open: body.open }), {
    status: 200,
  });
}
