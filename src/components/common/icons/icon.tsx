import { styled } from "@mui/material/styles";

// ================================================================

export type IconProps = React.ComponentPropsWithRef<"img"> & {
  size?: number;
  disabled?: boolean;
};

export const Icon = styled("img", {
  shouldForwardProp: prop => prop !== "size",
})<{ size?: number; disabled?: boolean }>(({ size = 32, disabled }) => ({
  width: `${size}px`,
  height: `${size}px`,
  filter: disabled ? `grayscale(1)` : undefined,
  opacity: disabled ? 0.2 : undefined,
}));
