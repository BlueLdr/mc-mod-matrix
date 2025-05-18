import type { ThemeAdditions } from "~/theme";
import type { Colors as McmmColors } from "./theme/colors";

//================================================

declare module "@mui/material/styles" {
  interface Theme extends ThemeAdditions {
    palette: Palette;
  }

  interface Palette {
    common: McmmColors;
  }

  interface PaletteOptions {
    common?: McmmColors;
  }
}
