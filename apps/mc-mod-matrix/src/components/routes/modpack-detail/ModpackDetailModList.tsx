"use client";

import { useContext, useState } from "react";

import { classNameWithModifiers, pluralize } from "@mcmm/utils";
import { ModListEditable } from "~/components";
import { StorageContext } from "~/context";
import { MOD_DETAIL_MODAL_SEARCH_PARAM, useSearchParamSetter } from "~/utils";

import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import Grid from "@mui/material/Grid";

import type { Modpack } from "@mcmm/data";

//================================================

export type ModpackDetailModListProps = {
  pack: Modpack;
};

export function ModpackDetailModList({ pack }: ModpackDetailModListProps) {
  const setModDetailTarget = useSearchParamSetter(MOD_DETAIL_MODAL_SEARCH_PARAM);
  const { updatePack } = useContext(StorageContext);

  const [editMode, setEditMode] = useState(false);

  return (
    <Box marginBlock={6}>
      <ModListEditable
        editMode={editMode}
        setEditMode={setEditMode}
        items={pack.mods}
        onSave={items =>
          updatePack({
            ...pack,
            mods: items,
          })
        }
        showPlatforms="link"
        minGameVersion={pack.versions.min}
        onClickItem={(_, item) => setModDetailTarget(item.id)}
        getItemContentRight={item =>
          editMode ? undefined : (
            <Grid
              maxHeight={24}
              className={classNameWithModifiers(
                "mcmm-ModListItem__alternatives",
                { "--empty": !item.alternatives?.length },
                true,
              )}
            >
              {!!item.alternatives?.length && (
                <Chip
                  variant="outlined"
                  size="small"
                  color="primary"
                  label={`${item.alternatives.length} ${pluralize("Alternative", item.alternatives.length)}`}
                />
              )}
            </Grid>
          )
        }
      />
    </Box>
  );
}
