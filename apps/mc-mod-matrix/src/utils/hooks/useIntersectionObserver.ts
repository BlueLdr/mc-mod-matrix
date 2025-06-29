"use client";

import { useCallback, useEffect, useState } from "react";

import { useValueRef } from "~/utils";

//================================================

export type IntersectionObserverEntryCallback = (
  entry: IntersectionObserverEntry,
  observer: IntersectionObserver,
) => void;

export type UseIntersectionObserverOptions = Omit<IntersectionObserverInit, "root"> & {
  root?: HTMLElement | null;
  disabled?: boolean;
};

const createIntersectionObserver = (
  root: Element | undefined,
  callbacks: Map<Element, IntersectionObserverEntryCallback>,
  options?: UseIntersectionObserverOptions,
) =>
  "IntersectionObserver" in global
    ? new IntersectionObserver(
        (entries, observer) => {
          for (const entry of entries) {
            const callback = callbacks.get(entry.target);
            if (callback) {
              callback(entry, observer);
            }
          }
        },
        {
          ...options,
          root,
        },
      )
    : undefined;

export const useIntersectionObserver = ({
  root,
  disabled,
  ...options
}: UseIntersectionObserverOptions = {}) => {
  const optionsEquality = JSON.stringify(options);
  const disabledRef = useValueRef(disabled);

  const [observer, setObserver] = useState<IntersectionObserver>();
  const [callbacks] = useState(() => new Map<Element, IntersectionObserverEntryCallback>());

  useEffect(() => {
    if (root !== null) {
      const newObserver = createIntersectionObserver(root, callbacks, options);
      setObserver(newObserver);
      return () => newObserver?.disconnect();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [root, optionsEquality]);

  useEffect(() => {
    if (disabled) {
      observer?.disconnect();
      return () => {
        Array.from(callbacks.keys()).forEach(element => {
          observer?.observe(element);
        });
      };
    }
  }, [callbacks, disabled, observer]);

  return useCallback(
    (element: HTMLElement, callback: IntersectionObserverEntryCallback) => {
      if (element) {
        callbacks.set(element, callback);
        if (!disabledRef.current) {
          observer?.observe(element);
        }
        return () => {
          callbacks.delete(element);
          observer?.unobserve(element);
        };
      }
    },
    [callbacks, disabledRef, observer],
  );
};
