"use client";

import { useContext, useEffect } from "react";

import { ModpackDetailPage, ModpackDetailPageLoading, SkeletonFade } from "~/components";
import { DataInitializer, StorageContext } from "~/context";
import { PLACEHOLDER_TITLE_TEXT } from "~/utils";

import NotFoundPage from "../not-found";

import type { PageProps } from "~/utils";

//================================================

export type ModpackDetailPageProps = PageProps<{
  id: string;
}>;

export default function ModpackDetailRoutePage({ params }: ModpackDetailPageProps) {
  const { currentPack } = useContext(StorageContext);
  const title = "window" in global ? document.title : undefined;
  useEffect(() => {
    if (currentPack) {
      document.title = document.title.replace(PLACEHOLDER_TITLE_TEXT, currentPack.name);
      const timer = setTimeout(() => {
        document.title = document.title.replace(PLACEHOLDER_TITLE_TEXT, currentPack.name);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [currentPack, title]);

  if (!currentPack) {
    return "window" in global ? <NotFoundPage /> : null;
  }

  return (
    <DataInitializer
      initialLoadingView={
        <SkeletonFade sx={{ maxHeight: `calc(100vh - 12rem)` }}>
          <ModpackDetailPageLoading />
        </SkeletonFade>
      }
    >
      <ModpackDetailPage pack={currentPack} />
    </DataInitializer>
  );
}
