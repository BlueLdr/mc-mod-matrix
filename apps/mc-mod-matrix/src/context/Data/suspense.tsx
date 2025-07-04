"use client";

import { useContext, useEffect } from "react";
import useSWR from "swr";

import { SuspenseBoundary } from "~/components";
import { DataContext } from "~/context";
import { useRemotePromise } from "~/utils";

import type { WithChildren } from "@mcmm/types";

//================================================

function DataInitializerBase({ children }: WithChildren) {
  const { allMods } = useContext(DataContext);
  const [promise, remoteRef] = useRemotePromise<any>();
  useEffect(() => {
    if (allMods) {
      remoteRef.current?.resolve(allMods);
    }
  }, [allMods, remoteRef]);

  useSWR(allMods ? null : [promise], () => promise, {
    suspense: true,
  });

  return children;
}

export type DataInitializerProps = WithChildren & {
  initialLoadingView: React.ReactNode;
};

export function DataInitializer({ children, initialLoadingView }: DataInitializerProps) {
  const { allMods } = useContext(DataContext);

  return (
    <SuspenseBoundary initialLoadingView={initialLoadingView}>
      <DataInitializerBase>{!allMods ? initialLoadingView : children}</DataInitializerBase>
    </SuspenseBoundary>
  );
}
