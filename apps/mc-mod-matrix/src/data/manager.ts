import { CurseforgePlatformPlugin } from "@mcmm/curseforge";
import { ModrinthPlatformPlugin } from "@mcmm/modrinth";
import { PlatformPluginManager } from "@mcmm/platform";

//================================================

export const platformManager = new PlatformPluginManager([
  new CurseforgePlatformPlugin(),
  new ModrinthPlatformPlugin(),
]);
