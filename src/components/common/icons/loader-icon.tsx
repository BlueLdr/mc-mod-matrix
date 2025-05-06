import {
  FabricIconSvg,
  ForgeIconSvg,
  NeoforgeIconSvg,
  QuiltIconSvg,
} from "~/assets";
import { SvgIcon, type SvgIconProps } from "./svg-icon";

//================================================

export type LoaderIconProps = Omit<SvgIconProps, "src">;

export const FabricIcon = (props: LoaderIconProps) => (
  <SvgIcon {...props} src={FabricIconSvg} />
);
export const ForgeIcon = (props: LoaderIconProps) => (
  <SvgIcon {...props} src={ForgeIconSvg} />
);
export const NeoforgeIcon = (props: LoaderIconProps) => (
  <SvgIcon {...props} src={NeoforgeIconSvg} />
);
export const QuiltIcon = (props: LoaderIconProps) => (
  <SvgIcon {...props} src={QuiltIconSvg} />
);
