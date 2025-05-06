import { ModLoader } from "~/data";
import { FabricIcon, ForgeIcon, NeoforgeIcon, QuiltIcon } from "./loader-icon";

import type { LoaderIconProps } from "./loader-icon";

//================================================

export const LoaderIcons = {
  [ModLoader.Fabric]: FabricIcon,
  [ModLoader.Forge]: ForgeIcon,
  [ModLoader.NeoForge]: NeoforgeIcon,
  [ModLoader.Quilt]: QuiltIcon,
} satisfies Record<ModLoader, React.ComponentType<LoaderIconProps>>;

export * from "./icon";
export * from "./platform-icon";
export * from "./loader-icon";
