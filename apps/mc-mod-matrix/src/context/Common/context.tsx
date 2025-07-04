"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";

import { gameVersionComparator } from "@mcmm/utils";
import { modrinthApi } from "@mcmm/modrinth";

import type { GameVersion } from "@mcmm/data";
import type { WithChildren } from "@mcmm/types";
import type { AppCommonState } from "./types";

//================================================

export const CommonContext = createContext<AppCommonState>({
  gameVersions: [],
});

export const useVersionRange = (min: GameVersion, max: GameVersion) => {
  const { gameVersions } = useContext(CommonContext);
  return useMemo(
    () =>
      gameVersions.filter(
        version =>
          gameVersionComparator(version, max) <= 0 && gameVersionComparator(version, min) >= 0,
      ),

    [gameVersions, min, max],
  );
};

//================================================

export const CommonProvider: React.FC<WithChildren> = ({ children }) => {
  const [gameVersions, setGameVersions] = useState<GameVersion[]>([]);
  useEffect(() => {
    modrinthApi.getGameVersions().then(({ data }) => {
      if (data) {
        setGameVersions(
          data
            .filter(item => item.version_type === "release")
            .map(item => item.version as GameVersion),
        );
      }
    });
    // curseforgeApi.getVersionTypes();
  }, []);

  const value = useMemo(() => ({ gameVersions }), [gameVersions]);

  return <CommonContext value={value}>{children}</CommonContext>;
};
