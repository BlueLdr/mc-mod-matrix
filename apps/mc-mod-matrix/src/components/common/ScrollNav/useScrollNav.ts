"use client";

import { range } from "lodash";
import { useCallback, useContext, useEffect } from "react";

import { useIntersectionObserver, useMounted } from "~/utils";

import { ScrollNavContext } from "./context";

import type { ScrollNavSectionBaseProps } from "./ScrollNavSection";
import type { UseIntersectionObserverOptions } from "~/utils";
import type { ScrollNavOptions } from "./types";

//================================================

export type WithScrollNavProps = {
  threshold?: number;
} & Omit<UseIntersectionObserverOptions, "threshold"> &
  ScrollNavOptions;

export function useScrollNav({ threshold = 0.5, scrollOffset, ...props }: WithScrollNavProps) {
  useMounted();
  const { setCurrentAnchor } = useContext(ScrollNavContext);
  useEffect(() => {
    return () => setCurrentAnchor(undefined);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const registerChild = useIntersectionObserver({
    threshold: [threshold, ...range(0, threshold, 0.05), ...range(1, threshold, -0.05)].sort(),
    ...props,
  });

  const register = useCallback(
    (element: HTMLElement, id: string) =>
      registerChild(element, entry => {
        if (
          id &&
          entry.isIntersecting &&
          entry.intersectionRect.height >=
            (entry.rootBounds?.height ?? window.innerHeight) * threshold
        ) {
          setCurrentAnchor(id);
        }
      }),
    [registerChild, setCurrentAnchor, threshold],
  );

  return {
    register,
    scrollOffset,
  } satisfies Pick<ScrollNavSectionBaseProps, "register" | "scrollOffset">;
}
