"use client";

import { SvgIcon } from "./svg-icon";

import type { SvgIconProps } from "./svg-icon";
import type { ModLoader } from "~/data";

//================================================

export type LoaderIconProps = Omit<SvgIconProps, "src"> & {
  loader: ModLoader;
};

export const LoaderIcon = ({ loader, ...props }: LoaderIconProps) => (
  <SvgIcon {...props} src={`/${loader}.svg`} />
);
