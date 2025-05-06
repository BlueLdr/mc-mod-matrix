import { CURSEFORGE_BASE_URL, CURSEFORGE_MC_GAME_ID } from "./curseforge"

export const CURSEFORGE_MINECRAFT_VERSIONS_URL = `${CURSEFORGE_BASE_URL}/games/${CURSEFORGE_MC_GAME_ID}`

export const fetchMinecraftVersions = () => fetch(CURSEFORGE_MINECRAFT_VERSIONS_URL)