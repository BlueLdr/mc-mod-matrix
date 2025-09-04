import { CurseforgePlatformPlugin } from "@mcmm/curseforge";
import { ModrinthPlatformPlugin } from "@mcmm/modrinth";
import { PlatformPluginManager } from "@mcmm/platform";

import type { PlatformPluginTypes } from "@mcmm/platform";

//================================================

export const platformManager = new PlatformPluginManager<PlatformPluginTypes>([
  new CurseforgePlatformPlugin(),
  new ModrinthPlatformPlugin(),
]);
