// ================================================================

import { Icon } from "./icon";
import type { IconProps } from "./icon";

export type PlatformIconProps = Omit<IconProps, "src">;

export const ModrinthIcon = (props: PlatformIconProps) => (
  <Icon
    {...props}
    src="https://media.beehiiv.com/cdn-cgi/image/fit=scale-down,format=auto,onerror=redirect,quality=80/uploads/publication/logo/a49f8e1b-3835-4ea1-a85b-118c6425ebc3/Modrinth_Dark_Logo.png"
  />
);

export const CurseforgeIcon = (props: PlatformIconProps) => (
  <Icon
    {...props}
    src="https://www.curseforge.com/images/sprite.svg#footer-logo-desktop"
  />
);
