"use client";

import { notFound } from "next/navigation";
import { useContext } from "react";

import { ModpackDetailModList } from "~/components";
import { DataContext } from "~/context";

import type { PageProps } from "~/utils";

//================================================

export type ModpackDetailPageProps = PageProps<{
  name: string;
}>;

export default function ModpackDetailPage({ params }: ModpackDetailPageProps) {
  const { currentPack } = useContext(DataContext);
  if (!currentPack) {
    return notFound();
  }

  return <ModpackDetailModList pack={currentPack} />;
}
