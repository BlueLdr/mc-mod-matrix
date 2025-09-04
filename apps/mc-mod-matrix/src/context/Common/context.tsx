"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { cloneDeep } from "lodash";

import { curseforgeModLoaderTypeMap } from "@mcmm/curseforge";
import { PlatformPlugin } from "@mcmm/platform";
import { gameVersionComparator } from "@mcmm/utils";
import { modrinthApi } from "@mcmm/modrinth";

import type { GameVersion } from "@mcmm/data";
import type { Curseforge } from "@mcmm/curseforge";
import type { WithChildren } from "@mcmm/types";
import type { AppCommonState } from "./types";

//================================================

export const CommonContext = createContext<AppCommonState>({
  gameVersions: [],
  loaderVersions: {},
  setLoaderVersions: () => undefined,
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

const mergeModLoaderData = (
  data: AppCommonState["loaderVersions"],
  versions: Curseforge.MinecraftModLoaderIndex[],
) => {
  const newData = cloneDeep(data);
  versions.forEach(v => {
    const loader = curseforgeModLoaderTypeMap[v.type];
    if (!newData[loader]) {
      newData[loader] = {};
    }
    if (!newData[loader][v.gameVersion]) {
      newData[loader][v.gameVersion] = [];
    }
    if (!newData[loader][v.gameVersion].find(i => i.name === v.name)) {
      newData[loader][v.gameVersion].push(v);
    }
  });
  return newData;
};

export const CommonProvider: React.FC<WithChildren> = ({ children }) => {
  const [gameVersions, setGameVersions] = useState<GameVersion[]>([]);
  const [loaderVersions, _setLoaderVersions] = useState<AppCommonState["loaderVersions"]>({});
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

  useEffect(() => {
    PlatformPlugin.allGameVersions = gameVersions;
  }, [gameVersions]);

  const setLoaderVersions = useCallback<AppCommonState["setLoaderVersions"]>(versions => {
    _setLoaderVersions(prev => mergeModLoaderData(prev, versions));
  }, []);

  const value = useMemo<AppCommonState>(
    () => ({
      gameVersions,
      loaderVersions,
      setLoaderVersions,
    }),
    [gameVersions, loaderVersions, setLoaderVersions],
  );

  return <CommonContext value={value}>{children}</CommonContext>;
};
