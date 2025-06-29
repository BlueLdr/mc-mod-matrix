import type { IconProps } from "./icon";
import type { SxStyleProps } from "~/theme";

//================================================

export const iconBaseStyles = ({ size = 32, disabled }: IconProps) =>
  ({
    width: `${size}px`,
    height: `${size}px`,
    filter: disabled ? `grayscale(1)` : undefined,
    opacity: disabled ? 0.2 : undefined,
  }) satisfies SxStyleProps;
