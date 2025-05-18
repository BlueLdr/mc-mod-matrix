"use client";

import { notFound } from "next/navigation";
import { useContext } from "react";

import { DataContext } from "~/context";
import { ModpackMatrixPageContent } from "~/components";

//================================================

export default function ModpackMatrixPage() {
  const { currentPack } = useContext(DataContext);
  if (!currentPack) {
    return notFound();
  }

  return <ModpackMatrixPageContent pack={currentPack} />;
}
