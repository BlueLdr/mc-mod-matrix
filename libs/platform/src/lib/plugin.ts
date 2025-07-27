import type { ApiResponse } from "@mcmm/api";
import type { GameVersion, Platform, PlatformModMetadata } from "@mcmm/data";
import type { ExtraDataForPlatform, GetModVersionsResponse } from "./types";

//================================================

export abstract class PlatformPlugin<
  P extends Platform,
  PlatformMeta,
  IdType extends string | number = string | number,
> {
  public abstract readonly platformName: P;
  public abstract readonly modUrlBase: string;
  public abstract readonly idType: "string" | "number";

  public abstract toModMetadata(record: PlatformMeta): PlatformModMetadata<P, IdType>;

  public abstract fromModMetadata(meta: PlatformModMetadata<P, IdType>): PlatformMeta;

  public abstract searchMods: (search: string) => Promise<ApiResponse<PlatformMeta[]>>;

  public abstract getModVersions(
    meta: PlatformModMetadata<P>,
    minGameVersion: GameVersion,
    extraData?: ExtraDataForPlatform<P>,
  ): Promise<ApiResponse<GetModVersionsResponse<P>>>;
}
