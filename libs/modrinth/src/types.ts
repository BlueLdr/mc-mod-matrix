import type { ModrinthPlatformModMetadata } from "./plugin";
import type { Platform } from "@mcmm/data";
import type { PlatformPluginTypesTemplate } from "@mcmm/platform";
import type * as Modrinth from "./lib/types";

//================================================

export interface PlatformPluginTypesModrinthPlugin {
  [Platform.Modrinth]: PlatformPluginTypesTemplate<
    ModrinthPlatformModMetadata,
    Modrinth.FileWithVersionInfo,
    Modrinth.ModpackManifest,
    ModrinthPlatformModMetadata["project_id"]
  >
}
