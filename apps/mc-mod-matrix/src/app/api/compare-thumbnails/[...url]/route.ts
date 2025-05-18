import resemble from "resemblejs";

import type { NextRequest } from "next/server";

//================================================

export const dynamic = "force-static";

const getImage = (url: string) =>
  fetch(url, { cache: "force-cache" }).then(async res => {
    const buffer = Buffer.from(await res.arrayBuffer());
    if (res.headers.get("Content-Type") === "image/webp") {
      return `data:image/webp;base64,${buffer.toString("base64")}`;
    }
    return buffer;
  });

const areThumbnailsSame = async (imageUrl1: string, imageUrl2: string): Promise<boolean> => {
  const image1 = await getImage(imageUrl1);
  const image2 = await getImage(imageUrl2);

  return new Promise(resolve =>
    resemble(image1)
      .compareTo(image2)
      .scaleToSameSize()
      .ignoreAntialiasing()
      .onComplete((result, ...args) => {
        if (result.rawMisMatchPercentage <= 20) {
          return resolve(true);
        }
        if (result.rawMisMatchPercentage >= 50) {
          return resolve(false);
        }
        resemble(image2)
          .compareTo(image1)
          .scaleToSameSize()
          .ignoreAntialiasing()
          .onComplete(result2 => {
            resolve(result2.rawMisMatchPercentage <= 20);
          });
      }),
  );
};

export async function GET(request: NextRequest) {
  const [url1, url2] = request.nextUrl.pathname
    .replace("/api/compare-thumbnails/", "")
    .split("/")
    .map(decodeURIComponent);
  if (!url1) {
    return Response.json("Missing required query param `url1`", { status: 400 });
  }
  if (!url2) {
    return Response.json("Missing required query param `url2`", { status: 400 });
  }

  return Response.json(await areThumbnailsSame(url1, url2));
}
