"use client";

import { useEffect, useRef } from "react";

import { Anchor } from "../Anchor";

import type { DistributiveOmit } from "@mcmm/types";
import type { ScrollNavOptions } from "./types";

//================================================

export type ScrollNavSectionBaseProps = {
  id: string;
  children: React.ReactNode;
  register: (element: HTMLElement, id: string) => void;
} & ScrollNavOptions;

export type ScrollNavSectionProps<Props> = ScrollNavSectionBaseProps &
  DistributiveOmit<
    | ({ component: React.ElementType<Props> } & Props)
    | ({ component?: never } & React.HTMLAttributes<"div">),
    keyof ScrollNavSectionBaseProps
  >;

export function ScrollNavSection<Props>({
  id,
  register,
  scrollOffset,
  children,
  component,
  ...props
}: ScrollNavSectionProps<Props>) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (ref.current) {
      return register(ref.current, id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [register, ref.current]);

  const Component = component ?? "div";

  return (
    // @ts-expect-error: still works
    <Component ref={ref} {...props}>
      <Anchor id={id} scrollOffset={scrollOffset} />
      {children}
    </Component>
  );
}
