"use client";

import { SvgIcon } from "./svg-icon";

import type { ModLoader } from "@mcmm/data";
import type { SvgIconProps } from "./svg-icon";

//================================================

export type LoaderIconProps = Omit<SvgIconProps, "src"> & {
  loader: ModLoader;
};

export const LoaderIcon = ({ loader, ...props }: LoaderIconProps) => (
  <SvgIcon {...props} src={`/${loader}.svg`} />
);
