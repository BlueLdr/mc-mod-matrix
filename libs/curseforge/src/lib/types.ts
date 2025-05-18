/**
 * Painstakingly transcribed from https://docs.curseforge.com/rest-api
 * Up to date as of 05/14/25
 */

/** */
export interface Category {
  id: number;
  gameId: number;
  name: string;
  slug: string;
  url: string;
  iconUrl: string;
  dateModified: string; // UTC datetime string
  isClass: boolean | null;
  classId: number | null;
  parentCategoryId: number | null;
  displayIndex: number | null;
}

export enum CoreApiStatus {
  Private = 1,
  Public,
}

export enum CoreStatus {
  Draft = 1,
  Test,
  PendingReview,
  Rejected,
  Approved,
  Live,
}

export interface FeaturedModsResponse {
  featured: Mod[];
  popular: Mod[];
  recentlyUpdated: Mod[];
}

export interface GetModFilesParams {
  gameVersion?: string;
  modLoaderType?: ModLoaderType;
  gameVersionTypeId?: number;
  index?: number;
  pageSize?: number;
}

export interface File {
  id: number;
  gameId: number;
  modId: number;
  isAvailable: boolean;
  displayName: string;
  fileName: string;
  releaseType: FileReleaseType;
  fileStatus: FileStatus;
  hashes: FileHash[];
  fileDate: string; // UTC datetime string
  fileLength: number;
  downloadCount: number;
  fileSizeOnDisk: number | null;
  downloadUrl: string;
  gameVersions: string[];
  sortableGameVersions: SortableGameVersion[];
  dependencies: FileDependency[];
  exposeAsAlternative: boolean | null;
  parentProjectFileId: number | null;
  alternateFileId: number | null;
  isServerPack: boolean | null;
  serverPackFileId: number | null;
  isEarlyAccessContent: boolean | null;
  earlyAccessEndDate: string | null; // UTC datetime string
  fileFingerprint: number;
  modules: FileModule[];
}

export interface FileDependency {
  modId: number;
  relationType: FileRelationType;
}

export enum FileStatus {
  Processing = 1,
  ChangesRequired,
  UnderReview,
  Approved,
  Rejected,
  MalwareDetected,
  Deleted,
  Archived,
  Testing,
  Released,
  ReadyForReview,
  Deprecated,
  Baking,
  AwaitingPublishing,
  FailedPublishing,
  Cooking,
  Cooked,
  UnderManualReview,
  ScanningForMalware,
  ProcessingFile,
  PendingRelease,
  ReadyForCooking,
  PostProcessing,
}

export enum HashAlgo {
  Sha1 = 1,
  Md5,
}

export interface FileHash {
  value: string;
  algo: HashAlgo;
}

export interface FileIndex {
  gameVersion: string;
  fileId: number;
  filename: string;
  releaseType: FileReleaseType;
  gameVersionTypeId: number | null;
  modLoader: ModLoaderType;
}

export interface FileModule {
  name: string;
  fingerprint: number;
}

export enum FileRelationType {
  EmbeddedLibrary = 1,
  OptionalDependency,
  RequiredDependency,
  Tool,
  Incompatible,
  Include,
}

export enum FileReleaseType {
  Release = 1,
  Beta,
  Alpha,
}

export interface FingerprintMatch {
  id: number;
  file: File;
  latestFiles: [File];
}

export interface FingerprintFuzzyMatch extends FingerprintMatch {
  fingerprints: number[];
}

export interface FingerprintFuzzyMatchResult {
  fuzzyMatches: FingerprintFuzzyMatch[];
}

export interface FolderFingerprint {
  foldername: string;
  fingerprints: number[];
}

export interface Game {
  id: number;
  name: string;
  slug: string;
  dateModified: string; // UTC datetime string
  assets: GameAssets;
  status: CoreStatus;
  apiStatus: CoreApiStatus;
}

export interface GameAssets {
  iconUrl: string;
  tileUrl: string;
  coverUrl: string;
}

export interface GameVersion {
  id: number;
  slug: string;
  name: string;
}

export interface GameVersionsByType {
  type: number;
  versions: string[];
}

export interface GameVersionsByType2 {
  type: number;
  versions: GameVersion[];
}

export enum GameVersionStatus {
  Approved = 1,
  Deleted,
  New,
}

export interface GameVersionType {
  id: number;
  gameId: number;
  name: string;
  slug: string;
  isSyncable: boolean;
  status: GameVersionTypeStatus;
}

export enum GameVersionTypeStatus {
  Normal = 1,
  Deleted,
}

export interface MinecraftGameVersion {
  id: number;
  gameVersionId: number;
  versionString: string;
  jarDownloadUrl: string;
  jsonDownloadUrl: string;
  approved: boolean;
  dateModified: string;
  gameVersionTypeId: number;
  gameVersionStatus: GameVersionStatus;
  gameVersionTypeStatus: GameVersionTypeStatus;
}

export interface MinecraftModLoaderIndex {
  name: string;
  gameVersion: string;
  latest: boolean;
  recommended: boolean;
  dateModified: string;
  type: ModLoaderType;
}

export interface MinecraftModLoaderVersion {
  id: number;
  gameVersionId: number;
  minecraftGameVersionId: number;
  forgeVersion: string;
  name: string;
  type: ModLoaderType;
  downloadUrl: string;
  filename: string;
  installMethod: ModLoaderInstallMethod;
  latest: boolean;
  recommended: boolean;
  approved: boolean;
  dateModified: string; // UTC datetime string
  mavenVersionString: string;
  versionJson: string;
  librariesInstallLocation: string;
  minecraftVersion: string;
  additionalFilesJson: string;
  modLoaderGameVersionId: number;
  modLoaderGameVersionTypeId: number;
  modLoaderGameVersionStatus: GameVersionStatus;
  modLoaderGameVersionTypeStatus: GameVersionTypeStatus;
  mcGameVersionId: number;
  mcGameVersionTypeId: number;
  mcGameVersionStatus: GameVersionStatus;
  mcGameVersionTypeStatus: GameVersionTypeStatus;
  installProfileJson: string;
}

export interface GetModLoadersParams {
  version?: string;
  includeAll?: boolean;
}

export interface Mod {
  id: number;
  gameId: number;
  name: string;
  slug: string;
  links: ModLinks;
  summary: string;
  status: ModStatus;
  downloadCount: number;
  isFeatured: boolean;
  primaryCategoryId: number;
  categories: Category[];
  classId: number | null;
  authors: ModAuthor[];
  logo: ModAsset;
  screenshots: ModAsset[];
  mainFileId: number;
  latestFiles: File[];
  latestFileIndexes: FileIndex[];
  latestEarlyAccessFileIndexes: FileIndex[];
  dateCreated: string; // UTC datetime string
  dateModified: string; // UTC datetime string
  dateReleased: string; // UTC datetime string
  allowModDistribution: boolean | null;
  gamePopularityRank: number;
  isAvailable: boolean;
  thumbsUpCount: number;
  rating: number | null;
}

export interface ModAsset {
  id: number;
  modId: number;
  title: string;
  description: string;
  thumbnailUrl: string;
  url: string;
}

export interface ModAuthor {
  id: number;
  name: string;
  url: string;
  username: string;
}

export interface ModClass {
  id: ModClassEnum;
  dateModified: string; // ISO datetime string
  gameId: number;
  iconUrl: string;
  name: string;
  slug: string;
  url: string;
  classId: number | null;
  displayIndex: number;
  isClass: boolean;
  parentCategoryId?: number | null;
}

export interface ModLinks {
  websiteUrl: string;
  wikiUrl: string;
  issuesUrl: string;
  sourceUrl: string;
}

export enum ModLoaderInstallMethod {
  ForgeInstaller = 1,
  ForgeJarInstall,
  ForgeInstaller_v2,
  FabricInstaller,
  QuiltInstaller,
  NeoForgeInstaller,
}

export enum ModLoaderType {
  Any,
  "forge",
  Cauldron,
  LiteLoader,
  "fabric",
  "quilt",
  "neoforge",
}

export enum ModsSearchSortField {
  Featured = 1,
  Popularity,
  LastUpdated,
  Name,
  Author,
  TotalDownloads,
  Category,
  GameVersion,
  EarlyAccess,
  FeaturedReleased,
  ReleasedDate,
  Rating,
}

export enum ModClassEnum {
  mod = 6,
}

export enum ModStatus {
  New = 1,
  ChangesRequired,
  UnderSoftReview,
  Approved,
  Rejected,
  ChangesMade,
  Inactive,
  Abandoned,
  Deleted,
  UnderReview,
}

export interface Pagination {
  index: number;
  pageSize: number;
  resultCount: number;
  totalCount: number;
}

export interface SearchModsParams {
  gameId?: number;
  classId?: number;
  categoryId?: number;
  categoryIds?: string[];
  gameVersion?: string;
  gameVersions?: string[];
  filterText?: string;
  sortField?: ModsSearchSortField;
  sortOrder?: SortOrder;
  modLoaderType?: ModLoaderType;
  modLoaderTypes?: string[];
  gameVersionTypeId?: number;
  authorId?: number;
  primaryAuthorId?: number;
  slug?: string;
  index?: number;
  pageSize?: number;
}

export interface SearchModsResponse {
  data: SearchResult[];
  pagination: Pagination;
}

export interface SearchResult {
  id: number;
  author: ModAuthor;
  avatarUrl: string;
  thumbnailUrl: string;
  categories: Category[];
  class: ModClass | null;
  creationDate: number;
  downloads: number;
  gameVersion: string;
  name: string;
  slug: string;
  summary: string;
  updateDate: number;
  releaseDate: number;
  fileSize: number;
  isClientCompatible: boolean;
  latestFileDetails: FileIndex;
  hasEarlyAccessFiles: boolean;
  hasLocalization: boolean;
  status: ModStatus;
  websiteRecentFiles: SearchResultRecentFileCollection[];
  isMainFileClientCompatible: boolean;
  isPremium: boolean;
  thumbnails: {
    thumbnailUrl256: string;
    thumbnailUrl64: string;
  };
  isAvailableForDownload: boolean;
  downloadAvailability: number;
}

export interface SearchResultRecentFileCollection {
  gameVersion: GameVersion;
  files: File[];
}

export interface SortableGameVersion {
  gameVersionName: string;
  gameVersionPadded: string;
  gameVersion: string;
  gameVersionReleaseDate: string; // UTC datetime string
  gameVersionTypeId: number | null;
}

export type SortOrder = "asc" | "desc";

export interface VersionsByType {
  type: number;
  versions: GameVersion[];
}
