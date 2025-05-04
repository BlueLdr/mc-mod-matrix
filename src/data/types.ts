export interface Modpack {
    name: string;
    mods: Mod[]
}

export interface Mod {
    name: string,
    urls: string[]
    versions: ModVersion[]
}

export interface ModVersion {
    gameVersion: GameVersion;
    loader: ModLoader;
}

export type GameVersion = string;

export enum ModLoader {
    'Fabric' = "fabric",
    'NeoForge' = "neoforge",
    "Forge" = "forge"
}