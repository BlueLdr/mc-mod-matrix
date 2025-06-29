"use client";

import { styled } from "@mui/material/styles";

import { SvgIcon } from "./svg-icon";

import type { Platform, PlatformModMetadata } from "@mcmm/data";
import type { SvgIconProps } from "./svg-icon";

// ================================================================

const Link = styled("a")`
  display: block;

  & > i {
    display: block;
  }
`;

export type PlatformIconProps = Omit<SvgIconProps, "src"> &
  (
    | {
        platform: Platform;
        meta?: never;
      }
    | {
        platform?: never;
        meta: PlatformModMetadata;
      }
  );

export const PlatformIcon = ({ platform, meta, ...props }: PlatformIconProps) => {
  const platformName = platform ?? meta?.platform;
  const icon = (
    <SvgIcon
      color={`common.${platformName?.toLowerCase()}`}
      {...props}
      src={`/${platformName?.toLowerCase()}.svg`}
    />
  );
  if (meta) {
    return (
      <Link href={`https://modrinth.com/mod/${meta.slug}`} target="_blank">
        {icon}
      </Link>
    );
  }
  return icon;
};
