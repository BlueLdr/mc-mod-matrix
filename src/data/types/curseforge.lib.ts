/**
 * Painstakingly transcribed from https://docs.curseforge.com/rest-api
 * Up to date as of 05/14/25
 */

/** */
export interface Category {
  id: 0;
  gameId: 0;
  name: "string";
  slug: "string";
  url: "string";
  iconUrl: "string";
  dateModified: "2019-08-24T14:15:22Z";
  isClass: true | null;
  classId: 0 | null;
  parentCategoryId: 0 | null;
  displayIndex: 0 | null;
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

export interface File {
  id: 0;
  gameId: 0;
  modId: 0;
  isAvailable: true;
  displayName: "string";
  fileName: "string";
  releaseType: FileReleaseType;
  fileStatus: FileStatus;
  hashes: FileHash[];
  fileDate: "2019-08-24T14:15:22Z";
  fileLength: 0;
  downloadCount: 0;
  fileSizeOnDisk: 0 | null;
  downloadUrl: "string";
  gameVersions: string[];
  sortableGameVersions: SortableGameVersion[];
  dependencies: FileDependency[];
  exposeAsAlternative: true | null;
  parentProjectFileId: 0 | null;
  alternateFileId: 0 | null;
  isServerPack: true | null;
  serverPackFileId: 0 | null;
  isEarlyAccessContent: true | null;
  earlyAccessEndDate: "2019-08-24T14:15:22Z" | null;
  fileFingerprint: 0;
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
  gameVersion: "string";
  fileId: 0;
  filename: "string";
  releaseType: FileReleaseType;
  gameVersionTypeId: 0 | null;
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
  id: 0;
  name: "string";
  slug: "string";
  dateModified: "2019-08-24T14:15:22Z";
  assets: GameAssets;
  status: CoreStatus;
  apiStatus: CoreApiStatus;
}

export interface GameAssets {
  iconUrl: "string";
  tileUrl: "string";
  coverUrl: "string";
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
  id: 0;
  gameId: 0;
  name: "string";
  slug: "string";
  isSyncable: true;
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
  id: 0;
  gameVersionId: 0;
  minecraftGameVersionId: 0;
  forgeVersion: "string";
  name: "string";
  type: ModLoaderType;
  downloadUrl: "string";
  filename: "string";
  installMethod: ModLoaderInstallMethod;
  latest: true;
  recommended: true;
  approved: true;
  dateModified: "2019-08-24T14:15:22Z";
  mavenVersionString: "string";
  versionJson: "string";
  librariesInstallLocation: "string";
  minecraftVersion: "string";
  additionalFilesJson: "string";
  modLoaderGameVersionId: 0;
  modLoaderGameVersionTypeId: 0;
  modLoaderGameVersionStatus: GameVersionStatus;
  modLoaderGameVersionTypeStatus: GameVersionTypeStatus;
  mcGameVersionId: 0;
  mcGameVersionTypeId: 0;
  mcGameVersionStatus: GameVersionStatus;
  mcGameVersionTypeStatus: GameVersionTypeStatus;
  installProfileJson: "string";
}

export interface Mod {
  id: 0;
  gameId: 0;
  name: "string";
  slug: "string";
  links: ModLinks;
  summary: "string";
  status: ModStatus;
  downloadCount: 0;
  isFeatured: true;
  primaryCategoryId: 0;
  categories: Category[];
  classId: 0 | null;
  authors: ModAuthor[];
  logo: ModAsset;
  screenshots: ModAsset[];
  mainFileId: 0;
  latestFiles: File[];
  latestFileIndexes: FileIndex[];
  latestEarlyAccessFileIndexes: FileIndex[];
  dateCreated: "2019-08-24T14:15:22Z";
  dateModified: "2019-08-24T14:15:22Z";
  dateReleased: "2019-08-24T14:15:22Z";
  allowModDistribution: true | null;
  gamePopularityRank: 0;
  isAvailable: true;
  thumbsUpCount: 0;
  rating: 0 | null;
}

export interface ModAsset {
  id: 0;
  modId: 0;
  title: "string";
  description: "string";
  thumbnailUrl: "string";
  url: "string";
}

export interface ModAuthor {
  id: 0;
  name: "string";
  url: "string";
}

export interface ModLinks {
  websiteUrl: "string";
  wikiUrl: "string";
  issuesUrl: "string";
  sourceUrl: "string";
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

export enum ModSearchSortField {
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

export interface SearchModsResponse {
  data: Mod[];
  pagination: Pagination;
}

export interface SortableGameVersion {
  gameVersionName: "string";
  gameVersionPadded: "string";
  gameVersion: "string";
  gameVersionReleaseDate: "2019-08-24T14:15:22Z";
  gameVersionTypeId: 0 | null;
}

export interface VersionsByType {
  type: number;
  versions: GameVersion[];
}
