import type { ApiResponse } from "@mcmm/api";
import type {
  GameVersion,
  ModVersionData,
  Platform,
  PlatformModMetadata,
  VersionSet,
} from "@mcmm/data";

//================================================

export abstract class PlatformPlugin<
  PlatformMeta,
  IdType extends string | number = string | number,
> {
  public abstract readonly platformName: Platform;
  public abstract readonly modUrlBase: string;

  public abstract toModMetadata(record: PlatformMeta): PlatformModMetadata<IdType>;

  public abstract fromModMetadata(meta: PlatformModMetadata<IdType>): PlatformMeta;

  public abstract searchMods: (search: string) => Promise<ApiResponse<PlatformMeta[]>>;

  public abstract getModVersions(
    meta: PlatformModMetadata,
    minGameVersion: GameVersion,
  ): Promise<ApiResponse<VersionSet<ModVersionData>>>;
}
