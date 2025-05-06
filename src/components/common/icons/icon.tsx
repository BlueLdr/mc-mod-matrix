import { styled } from "@mui/material/styles";

// ================================================================

export type IconProps = React.ComponentPropsWithRef<"img"> & { size?: number };

export const Icon = styled("img", {
  shouldForwardProp: prop => prop !== "size",
})<{ size?: number }>(({ size = 32 }) => ({
  width: `${size}px`,
  height: `${size}px`,
}));
