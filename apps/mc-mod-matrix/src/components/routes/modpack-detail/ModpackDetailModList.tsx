"use client";

import { Fragment, useContext, useEffect, useMemo, useState } from "react";

import { classNameWithModifiers } from "@mcmm/utils";
import { ModAlternativeModal, ModListItem, ModPicker } from "~/components";
import { DataContext, DataRegistryContext } from "~/context";

import Divider from "@mui/material/Divider";
import Card from "@mui/material/Card";
import Edit from "@mui/icons-material/Edit";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import Grid from "@mui/material/Grid";
import Link from "@mui/material/Link";
import List from "@mui/material/List";
import Typography from "@mui/material/Typography";

import type { Mod, ModMetadata, Modpack } from "@mcmm/data";

//================================================

export type ModpackDetailModListProps = {
  pack: Modpack;
};

export function ModpackDetailModList({ pack }: ModpackDetailModListProps) {
  const { updatePack } = useContext(DataContext);
  const { storeMod, getMod, setModAlternatives } = useContext(DataRegistryContext);
  const [alternativesTarget, setAlternativesTarget] = useState<Mod>();

  const [modList, setModList] = useState(() => pack.mods);
  useEffect(() => {
    setModList(pack.mods);
  }, [pack]);

  const [editMode, setEditMode] = useState(false);

  const onClickSave = () => {
    updatePack({
      ...pack,
      mods: modList.map(mod => getMod(mod.meta.slug)).filter(m => !!m),
    });
    setEditMode(false);
  };
  const onClickCancel = () => {
    setModList(pack.mods);
    setEditMode(false);
  };

  const [loadingMod, setLoadingMod] = useState<ModMetadata>();

  const modMetaList = useMemo(() => modList.map(mod => mod.meta), [modList]);

  return (
    <Box marginBlock={6}>
      <Grid container mb={4} justifyContent="space-between" alignItems="center">
        <Grid container alignItems="center" spacing={3}>
          <Typography variant="h6">Mods</Typography>
          <Typography variant="overline">{modList.length}</Typography>
        </Grid>
        {editMode ? (
          <Grid container alignItems="center" spacing={3}>
            <Button variant="outlined" onClick={onClickCancel}>
              Cancel
            </Button>
            <Button variant="contained" onClick={onClickSave}>
              Save
            </Button>
          </Grid>
        ) : (
          <Button variant="outlined" startIcon={<Edit />} onClick={() => setEditMode(true)}>
            Edit
          </Button>
        )}
      </Grid>
      {editMode && (
        <ModPicker
          size="small"
          value={modMetaList}
          onChange={(_, newValue, __, details) => {
            if (details?.option) {
              setLoadingMod(details.option);
              storeMod(details.option, pack.versions.min).then(mod => {
                if (mod) {
                  setModList(prevState => [...prevState, mod]);
                  setLoadingMod(undefined);
                }
              });
            }
          }}
        />
      )}
      <Card variant="outlined" sx={{ paddingInline: 4, marginBlock: 4 }}>
        <List>
          {modList.map((item, index) => (
            <Fragment key={item.meta.slug}>
              {index > 0 && <Divider />}
              <ModListItem
                key={item.meta.slug}
                mod={item.meta}
                showPlatforms="link"
                sx={{
                  "&:not(:hover) .mcmm-ModListItem__alternatives--empty": {
                    display: "none",
                  },
                }}
                onRemove={
                  editMode
                    ? mod => setModList(list => list.filter(m => m.meta.slug !== mod.slug))
                    : undefined
                }
                contentRight={
                  editMode ? undefined : (
                    <Grid
                      maxHeight={24}
                      className={classNameWithModifiers(
                        "mcmm-ModListItem__alternatives",
                        { "--empty": !item.alternatives?.length },
                        true,
                      )}
                    >
                      <Link
                        typography="body2"
                        component="button"
                        onClick={() => setAlternativesTarget(item)}
                      >
                        {!item.alternatives?.length ? (
                          "+ Add alternatives"
                        ) : (
                          <Chip
                            clickable
                            variant="outlined"
                            size="small"
                            color="info"
                            label={`${item.alternatives.length} Alternatives`}
                          />
                        )}
                      </Link>
                    </Grid>
                  )
                }
              />
            </Fragment>
          ))}
          {loadingMod && (
            <>
              {modList.length > 0 && <Divider />}
              <ModListItem mod={loadingMod} showPlatforms loading />
            </>
          )}
        </List>
      </Card>
      <ModAlternativeModal
        mod={alternativesTarget}
        closeModal={() => setAlternativesTarget(undefined)}
        onSave={(mod, alts) => {
          setModAlternatives(mod, alts);
          updatePack({ ...pack });
        }}
        minVersion={pack.versions.min}
      />
    </Box>
  );
}
