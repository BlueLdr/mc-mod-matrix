import type {
  PlatformModExtraDataCurseforgePlugin,
  PlatformPluginTypesCurseforgePlugin,
} from "./types";

//================================================

declare module "@mcmm/platform" {
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type,@typescript-eslint/no-empty-interface
  interface PlatformPluginTypes extends PlatformPluginTypesCurseforgePlugin {}

  // eslint-disable-next-line @typescript-eslint/no-empty-object-type,@typescript-eslint/no-empty-interface
  interface PlatformModExtraData extends PlatformModExtraDataCurseforgePlugin {}
}
