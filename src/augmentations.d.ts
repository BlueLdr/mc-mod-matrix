import type { ThemeAdditions } from "~/theme";
import type { Colors as McmmColors } from "./colors";

//================================================

declare module "@mui/material/styles" {
  interface Theme extends ThemeAdditions {
    palette: Palette;
  }

  interface Palette {
    common: Palette["palette"] & McmmColors;
  }

  interface PaletteOptions {
    common?: PaletteOptions["common"] & McmmColors;
  }
}
