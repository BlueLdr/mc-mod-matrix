import type { SiteTheme } from "./theme";

//================================================

declare module "@emotion/react" {
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type,@typescript-eslint/no-empty-interface
  export interface Theme extends SiteTheme {}
}
