import type { Theme as MuiTheme, SxProps } from "@mui/material/styles";
import type { createSizes } from "./sizes";

//================================================

type AppSizes = ReturnType<typeof createSizes>;

export interface ThemeAdditions {
  sizes: AppSizes;
}

export interface SiteTheme extends MuiTheme, ThemeAdditions {}

export type SxStyleProps = SxProps<SiteTheme>;
