"use client";

import { notFound } from "next/navigation";
import { useContext, useEffect } from "react";

import { ModpackDetailPage, ModpackDetailPageLoading, SkeletonFade } from "~/components";
import { DataInitializer, StorageContext } from "~/context";
import { PLACEHOLDER_TITLE_TEXT } from "~/utils";

import type { PageProps } from "~/utils";

//================================================

export type ModpackDetailPageProps = PageProps<{
  id: string;
}>;

export default function ModpackDetailRoutePage({ params }: ModpackDetailPageProps) {
  const { currentPack } = useContext(StorageContext);
  useEffect(() => {
    if (currentPack) {
      document.title = document.title.replace(PLACEHOLDER_TITLE_TEXT, currentPack.name);
    }
  }, [currentPack]);

  if (!currentPack) {
    return "window" in global ? notFound() : null;
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
