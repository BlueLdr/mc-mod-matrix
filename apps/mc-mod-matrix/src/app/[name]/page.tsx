"use client";

import { notFound } from "next/navigation";
import { useContext } from "react";

import { ModpackDetailPage } from "~/components";
import { DataProvider, StorageContext } from "~/context";

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
    <DataProvider>
      <ModpackDetailPage pack={currentPack} />
    </DataProvider>
  );
}
