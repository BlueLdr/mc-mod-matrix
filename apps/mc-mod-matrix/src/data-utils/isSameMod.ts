"use client";

import { escapeRegExp } from "lodash";
import resemble from "resemblejs";

import { comparator } from "@mcmm/utils";
import { Platform } from "@mcmm/data";

import type { PlatformModMetadata } from "@mcmm/data";

//================================================

// const _cache_duration = Number(process.env.NEXT_PUBLIC_MCMM_THUMBNAIL_COMPARE_CACHE_DURATION);
// const CACHE_DURATION = isNaN(_cache_duration) ? 60 * 60 * 24 * 7 : _cache_duration;

const getImage = (url: string) =>
  new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = err => reject(err);
    // have to proxy through our server to get around canvas CORS
    const src = new URL(`/api/image/${encodeURIComponent(url)}`, window.location.origin);
    img.src = src.toString();
  });

const getImageData = (img: HTMLImageElement): string | undefined => {
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");
  canvas.width = img.width;
  canvas.height = img.height;
  context?.drawImage(img, 0, 0);
  return canvas?.toDataURL();
};

const areThumbnailsSameClientSide = async (imageUrl1: string, imageUrl2: string) => {
  const image1 = await getImage(imageUrl1);
  const image2 = await getImage(imageUrl2);
  const [larger, smaller] =
    image1.naturalWidth > image2.naturalWidth ? [image1, image2] : [image2, image1];

  const smallerData = getImageData(smaller);
  if (!smallerData) {
    return;
  }
  const largerData = getImageData(larger);
  if (!largerData) {
    return;
  }

  return new Promise<boolean>(resolve =>
    resemble(smallerData)
      .compareTo(largerData)
      .scaleToSameSize()
      .ignoreAntialiasing()
      .onComplete(result => {
        resolve(result.rawMisMatchPercentage <= 20);
      }),
  );
};

/*const areThumbnailsSame = async (imageUrl1: string, imageUrl2: string) => {
  const url = new URL(
    `/api/compare-thumbnails/${encodeURIComponent(imageUrl1)}/${encodeURIComponent(imageUrl2)}`,
    window.location.origin,
  );
  return fetch(url, {
    cache: "force-cache",
    headers: { "Cache-Control": `max-age=${CACHE_DURATION}` },
  }).then(response => response.json());
};*/

//================================================

const areModMetaValuesEqual = (m: string, c: string) =>
  new RegExp(`.*?${escapeRegExp(m)}.*?`, "i").test(c) ||
  new RegExp(`.*?${escapeRegExp(c)}.*?`, "i").test(m);

export const isSameMod = async (modA: PlatformModMetadata, modB: PlatformModMetadata) => {
  const [a, b] = [modA, modB].sort((_a, _b) =>
    _a.platform === Platform.Modrinth ? -1 : comparator("asc", "id")(_a, _b),
  );
  return (
    (areModMetaValuesEqual(a.slug, b.slug) || areModMetaValuesEqual(a.modName, b.modName)) &&
    (areModMetaValuesEqual(a.authorName, b.authorName) ||
      areModMetaValuesEqual(`${a.authorId}`, `${b.authorId}`) ||
      areModMetaValuesEqual(`${a.authorId}`, `${b.authorName}`) ||
      areModMetaValuesEqual(`${a.authorName}`, `${b.authorId}`) ||
      (!!a.thumbnailUrl &&
        !!(await areThumbnailsSameClientSide(a.thumbnailUrl, b.thumbnailUrl).catch(err => {
          console.error(err);
          return false;
        }))))
  );
};
