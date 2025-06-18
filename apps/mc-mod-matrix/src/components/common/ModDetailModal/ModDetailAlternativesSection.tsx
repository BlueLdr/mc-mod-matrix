"use client";

import { Fragment, useContext, useEffect, useImperativeHandle, useMemo, useState } from "react";

import { getUniqueIdForModMetadata } from "@mcmm/data";
import { ModListItem, ModPicker } from "~/components";
import { DataRegistryContext } from "~/context";
import { useAllModsMap } from "~/data-utils";
import { useMinVersion } from "~/data-utils/useMinVersion";

import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import Divider from "@mui/material/Divider";
import Grid from "@mui/material/Grid";
import List from "@mui/material/List";
import EditOutlined from "@mui/icons-material/EditOutlined";

import type { Mod, ModMetadata } from "@mcmm/data";

//================================================

export type ModDetailAlternativesSectionHandle = {
  cancel: () => void;
};

export type ModDetailAlternativesSectionProps = {
  mod: Mod | undefined;
  handleRef?: React.RefObject<ModDetailAlternativesSectionHandle | null>;
};

export function ModDetailAlternativesSection({
  handleRef,
  mod,
}: ModDetailAlternativesSectionProps) {
  const { storeMod, setModAlternatives } = useContext(DataRegistryContext);
  const [alternatives, setAlternatives] = useState(mod?.alternatives ?? []);

  const [loadingMod, setLoadingMod] = useState<ModMetadata>();
  const [editMode, setEditMode] = useState(false);
  const [saving, setSaving] = useState(false);

  const { dataRegistry } = useContext(DataRegistryContext);
  const allMods = useAllModsMap();

  const minVersion = useMinVersion(mod, dataRegistry);

  useEffect(() => {
    setAlternatives(mod?.alternatives ?? []);
  }, [mod]);

  const value = useMemo(
    () => alternatives.map(id => allMods?.get(id)?.meta).filter(item => !!item),
    [allMods, alternatives],
  );

  const onClickCancel = () => {
    setLoadingMod(undefined);
    setSaving(false);
    setEditMode(false);
    setAlternatives(mod?.alternatives ?? []);
  };

  useImperativeHandle(handleRef, () => ({
    cancel: onClickCancel,
  }));

  return (
    <>
      <Grid container mt={6} justifyContent="space-between" alignItems="center" gap={2}>
        <Typography variant="h6" fontSize={18}>
          Alternatives
        </Typography>
        <Grid container alignItems="center" gap={2}>
          {editMode ? (
            <>
              <Button disabled={saving} onClick={onClickCancel} variant="outlined">
                Cancel
              </Button>
              <Button
                variant="contained"
                loading={saving}
                onClick={
                  mod
                    ? () => {
                        setSaving(true);
                        setModAlternatives(mod, alternatives).then(() => {
                          setSaving(false);
                          setEditMode(false);
                        });
                      }
                    : undefined
                }
              >
                Save
              </Button>
            </>
          ) : (
            <IconButton
              onClick={() => setEditMode(true)}
              sx={{
                "&:not(:hover)": {
                  color: theme => theme.palette.grey[400],
                },
              }}
            >
              <EditOutlined />
            </IconButton>
          )}
        </Grid>
      </Grid>
      <Divider sx={{ marginBlock: theme => theme.spacing(2, 4) }} />
      <Grid container direction="column" spacing={2} my={2}>
        {editMode && !!minVersion && (
          <ModPicker
            size="small"
            value={value}
            onChange={async (_, newValue, __, details) => {
              if (details?.option) {
                if (!newValue.includes(details.option)) {
                  const removedMod = await dataRegistry.getModByMeta(details.option);
                  setAlternatives(prevValue => prevValue.filter(id => id !== removedMod?.modId));
                  return;
                }
                setLoadingMod(details.option);
                storeMod(details.option, minVersion).then(mod => {
                  if (mod) {
                    setAlternatives(prevValue => [...prevValue, mod.id]);
                    setLoadingMod(undefined);
                  }
                });
              }
            }}
          />
        )}
        {
          <Card variant="outlined" sx={{ paddingInline: 4 }}>
            {value.length > 0 ? (
              <List>
                {value.map((item, index) => {
                  const metaId = getUniqueIdForModMetadata(item);
                  return (
                    <Fragment key={metaId}>
                      {index > 0 && <Divider />}
                      <ModListItem
                        key={metaId}
                        mod={item}
                        showPlatforms="link"
                        sx={{
                          "&:not(:hover) .mcmm-ModListItem__alternatives--empty": {
                            display: "none",
                          },
                        }}
                        onRemove={
                          editMode
                            ? async modMeta => {
                                const mod = await dataRegistry.getModByMeta(modMeta);
                                setAlternatives(list => list.filter(id => id !== mod?.modId));
                              }
                            : undefined
                        }
                      />
                    </Fragment>
                  );
                })}
                {loadingMod && (
                  <>
                    {alternatives.length > 0 && <Divider />}
                    <ModListItem mod={loadingMod} showPlatforms loading />
                  </>
                )}
              </List>
            ) : (
              <Grid container height={128} alignItems="center" justifyContent="center">
                <Typography color="textDisabled" variant="subtitle1">
                  No alternatives added
                </Typography>
              </Grid>
            )}
          </Card>
        }
      </Grid>
    </>
  );

  return mod && <Grid py={4}></Grid>;
}
