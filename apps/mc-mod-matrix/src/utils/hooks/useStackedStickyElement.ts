"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { makeCalcString } from "@mcmm/utils";

import { useMounted } from "./dom";
import { useResizeObserver } from "./useResizeObserver";

//================================================

export const STICKY_CSS_VAR_BASE_NAME = `--sticky-lv`;
const STICKY_CSS_VAR_CUR_LEVEL_NAME = `--sticky-cur-lvl`;
const MAX_STICKY_LEVEL = 5;
const Z_INDEX_START = 50;
const Z_INDEX_INCREMENT = 20;

type StyleProps = React.ComponentProps<"div">["style"];

export const getCurrentStickyLevel = (element: Element) => {
  const styles = getComputedStyle(element);
  const level = Number(styles.getPropertyValue(STICKY_CSS_VAR_CUR_LEVEL_NAME));
  return isNaN(level) ? 0 : level;
};

export const getCurrentStickyOffset = (element: Element) => {
  const level = getCurrentStickyLevel(element);
  return level >= 1 ? `var(${STICKY_CSS_VAR_BASE_NAME}${level}, 0px)` : undefined;
};

export const useStackedStickyElement = (
  element: Element | null,
  offset: number | string = 0,
  disabled?: boolean,
  zIndex?: number,
): StyleProps => {
  const mounted = useMounted();
  const [height, setHeight] = useState(() =>
    element ? element.getBoundingClientRect().height : null,
  );
  const styledParentElements = useMemo(() => new Set<HTMLElement>(), []);

  useEffect(() => {
    if (mounted && element && !disabled) {
      setHeight(element.getBoundingClientRect().height);
    }
  }, [element, mounted, disabled]);

  const preLevel = useMemo(() => {
    if (!element || !element.parentElement?.parentElement || disabled) {
      return -1;
    }
    const level = getCurrentStickyLevel(element.parentElement.parentElement);
    if (level === MAX_STICKY_LEVEL) {
      console.warn(`Max number of sticky levels reached!`, element);
      return level - 1;
    }
    return level;
  }, [disabled, element]);

  const timerRef = useRef<any>(undefined);
  useResizeObserver(
    disabled ? null : element,
    useCallback((entry: ResizeObserverEntry) => {
      const height = entry.borderBoxSize[0].blockSize;
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
      timerRef.current = setTimeout(() => {
        setHeight(height);
        timerRef.current = undefined;
      }, 50);
    }, []),
  );

  const isActive = !!element && preLevel >= 0 && !disabled;

  useEffect(() => {
    if (isActive) {
      return () => {
        styledParentElements.forEach(el => {
          for (let i = 0; i <= preLevel; i++) {
            el.style.setProperty(`${STICKY_CSS_VAR_BASE_NAME}${preLevel + i}`, null);
          }
          el.style.setProperty(STICKY_CSS_VAR_CUR_LEVEL_NAME, null);
          el.style.setProperty(`${STICKY_CSS_VAR_BASE_NAME}${preLevel + 1}`, null);
        });
        styledParentElements.clear();
      };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isActive, element, preLevel]);

  if (!isActive) {
    return {};
  }

  const preVar = `var(${STICKY_CSS_VAR_BASE_NAME}${preLevel}, 0px)`;

  const parent = element.parentElement;
  if (parent) {
    styledParentElements.add(parent);
    for (let i = 0; i <= preLevel; i++) {
      parent?.style.setProperty(`${STICKY_CSS_VAR_BASE_NAME}${preLevel + i}`, null);
    }
    parent?.style.setProperty(STICKY_CSS_VAR_CUR_LEVEL_NAME, `${preLevel + 1}`);
    parent?.style.setProperty(
      `${STICKY_CSS_VAR_BASE_NAME}${preLevel + 1}`,
      makeCalcString(preVar, offset, height ?? 0),
    );
  }

  return {
    [STICKY_CSS_VAR_CUR_LEVEL_NAME as string]: preLevel,
    position: "sticky",
    top: makeCalcString(preVar, offset),
    zIndex: zIndex ?? Z_INDEX_START + (MAX_STICKY_LEVEL - preLevel) * Z_INDEX_INCREMENT,
  } satisfies StyleProps;
};
