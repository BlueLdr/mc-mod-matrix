"use client";

import { SvgIcon } from "./svg-icon";

import type { SvgIconProps } from "./svg-icon";

// ================================================================

export const ModrinthIcon = (props: Omit<SvgIconProps, "src">) => (
  <SvgIcon color="common.modrinth" {...props} src="/modrinth.svg" />
);

export const CurseforgeIcon = (props: Omit<SvgIconProps, "src">) => (
  <SvgIcon color="common.curseforge" {...props} src="/curseforge.svg" />
);
