import type { SiteTheme } from "~/theme/types.ts";

declare module "@emotion/react" {
  export interface Theme extends SiteTheme {}
}
