/* eslint-disable @typescript-eslint/no-empty-object-type,@typescript-eslint/no-empty-interface */

import type { ThemeAdditions } from "~/theme";
import type { McmmCommonColors, McmmBackgroundColors } from "./theme/colors";

//================================================

declare module "@mui/material/styles" {
  interface CommonColors extends McmmCommonColors {}

  interface TypeBackground extends McmmBackgroundColors {}

  interface Theme extends ThemeAdditions {}
}
