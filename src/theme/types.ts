import type { Theme as MuiTheme, SxProps } from "@mui/material/styles";
import type { Colors } from "./colors.ts";
import type { createSizes } from "./sizes";

//================================================

type PaletteBase = MuiTheme["palette"];

export interface ThemePalette extends PaletteBase {
  common: PaletteBase["common"] & Colors;
}

type AppSizes = ReturnType<typeof createSizes>;

export interface ThemeAdditions {
  sizes: AppSizes;
}

export interface SiteTheme extends Omit<MuiTheme, "palette"> {
  palette: ThemePalette;
}

export type StyleProps = SxProps<SiteTheme>;
