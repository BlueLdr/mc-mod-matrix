import { styled } from "@mui/material/styles";
import { get } from "lodash";

import { Icon } from "./icon";
import {
  ModrinthIcon as modrinthIcon,
  CurseforgeIcon as curseforgeIcon,
} from "~/assets";

import type { IconProps } from "./icon";

// ================================================================

const PlatformIcon = styled(Icon, {
  shouldForwardProp: propName => propName !== "color",
})<{ color?: string }>(({ color, theme }) => ({
  color: color
    ? ((value => (typeof value === "string" ? value : undefined))(
        get(theme.palette, color),
      ) ?? color)
    : undefined,
}));

export type PlatformIconProps = Omit<IconProps, "src"> & { color?: string };

export const ModrinthIcon = (props: PlatformIconProps) => (
  <PlatformIcon {...props} src={modrinthIcon} color="common.modrinth" />
);

export const CurseforgeIcon = (props: PlatformIconProps) => (
  <PlatformIcon {...props} src={curseforgeIcon} color="common.curseforge" />
);
