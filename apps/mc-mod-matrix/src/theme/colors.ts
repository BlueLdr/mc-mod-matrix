import type { PaletteOptions } from "@mui/material/styles";

//================================================

export interface McmmCommonColors {
  modrinth: string;
  curseforge: string;
}

export interface McmmBackgroundColors {
  layer: string;
}

export const colors = {
  common: {
    modrinth: "rgb(27, 217, 106)",
    curseforge: "rgb(241, 100, 54)",
  },
  primary: {
    main: "#219bfc",
  },
  background: {
    paper: "#202020",
    default: "#121212",
    layer: "rgba(255,255,255,0.04)",
  },
} as const satisfies PaletteOptions;
