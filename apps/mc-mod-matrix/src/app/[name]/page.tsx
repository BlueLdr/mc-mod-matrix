"use client";

import { notFound } from "next/navigation";
import { useContext } from "react";

import { ModpackDetailPage, ModpackDetailPageLoading, SkeletonFade } from "~/components";
import { DataInitializer, StorageContext } from "~/context";

import type { PageProps } from "~/utils";

//================================================

export type ModpackDetailPageProps = PageProps<{
  name: string;
}>;

export default function ModpackDetailRoutePage({ params }: ModpackDetailPageProps) {
  const { currentPack } = useContext(StorageContext);
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
      <ModpackDetailPage pack={currentPack} />;
    </DataInitializer>
  );
}
