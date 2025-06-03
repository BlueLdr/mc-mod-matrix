"use client";

import { notFound } from "next/navigation";
import { useContext } from "react";

import { ModpackDetailPage } from "~/components";
import { DataContext } from "~/context";

import type { PageProps } from "~/utils";

//================================================

export type ModpackDetailPageProps = PageProps<{
  name: string;
}>;

export default function ModpackDetailRoutePage({ params }: ModpackDetailPageProps) {
  const { currentPack } = useContext(DataContext);
  if (!currentPack) {
    return "window" in global ? notFound() : null;
  }

  return <ModpackDetailPage pack={currentPack} />;
}
