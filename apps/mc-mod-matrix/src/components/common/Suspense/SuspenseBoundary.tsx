"use client";

import { Suspense } from "react";

import { UseTransitionProvider } from "./TransitionContext";
import { ErrorBoundary } from "./ErrorBoundary";

//================================================

export type SuspenseViewProps = {
  /** Customize the initial loading view with e.g. a skeleton view; Defaults to a simple spinner */
  initialLoadingView: React.ReactNode;
  children: React.ReactNode;
  /**
   * The error/pending views will be wrapped in a Card if this is set to `true`;
   * The Card is omitted if a custom `initialLoadingView` is provided
   */
  card?: boolean;
};

/**
 * "Root" wrapper for a view that uses a Suspense query
 * @see {@link file://./README.md:39|SuspenseView/README.md}
 */
export function SuspenseBoundary({ children, initialLoadingView, card }: SuspenseViewProps) {
  return (
    <ErrorBoundary card={card}>
      <Suspense fallback={initialLoadingView}>
        <UseTransitionProvider>{children}</UseTransitionProvider>
      </Suspense>
    </ErrorBoundary>
  );
}
