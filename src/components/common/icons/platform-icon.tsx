import { SvgIcon } from "./svg-icon";
import { ModrinthIconSvg, CurseforgeIconSvg } from "~/assets";

import type { SvgIconProps } from "./svg-icon";

// ================================================================

export const ModrinthIcon = (props: Omit<SvgIconProps, "src">) => (
  <SvgIcon color="common.modrinth" {...props} src={ModrinthIconSvg} />
);

export const CurseforgeIcon = (props: Omit<SvgIconProps, "src">) => (
  <SvgIcon color="common.curseforge" {...props} src={CurseforgeIconSvg} />
);
