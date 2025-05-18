"use client";

import { styled } from "@mui/material/styles";

import { SvgIcon } from "./svg-icon";

import type { SvgIconProps } from "./svg-icon";

// ================================================================

const Link = styled("a")`
  display: block;

  & > i {
    display: block;
  }
`;

export type PlatformIconProps = Omit<SvgIconProps, "src"> & {
  modSlug?: string;
};

export const ModrinthIcon = ({ modSlug, ...props }: PlatformIconProps) => {
  const icon = (
    <SvgIcon color="common.modrinth" {...props} src="/modrinth.svg" />
  );
  if (modSlug) {
    return (
      <Link href={`https://modrinth.com/mod/${modSlug}`} target="_blank">
        {icon}
      </Link>
    );
  }
  return icon;
};

export const CurseforgeIcon = ({ modSlug, ...props }: PlatformIconProps) => {
  const icon = (
    <SvgIcon color="common.curseforge" {...props} src="/curseforge.svg" />
  );

  if (modSlug) {
    return (
      <Link
        href={`https://www.curseforge.com/minecraft/mc-mods/${modSlug}`}
        target="_blank"
      >
        {icon}
      </Link>
    );
  }
  return icon;
};
