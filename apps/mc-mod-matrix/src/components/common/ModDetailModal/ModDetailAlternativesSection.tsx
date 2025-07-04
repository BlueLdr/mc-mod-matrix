"use client";

import { Fragment, useContext, useEffect, useImperativeHandle, useMemo, useState } from "react";

import { getUniqueIdForModMetadata } from "@mcmm/data";
import { ModListItem, ModPicker } from "~/components";
import { DataRegistryContext } from "~/context";
import { useAllModsMap } from "~/data-utils";
import { useMinVersion } from "~/data-utils/useMinVersion";
import { MOD_DETAIL_MODAL_SEARCH_PARAM, useSearchParamSetter } from "~/utils";

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
  const { dataRegistry } = useContext(DataRegistryContext);
  const setModDetailTarget = useSearchParamSetter(MOD_DETAIL_MODAL_SEARCH_PARAM);
  const [alternatives, setAlternatives] = useState(mod?.alternatives ?? []);

  const [loadingMod, setLoadingMod] = useState<ModMetadata>();
  const [editMode, setEditMode] = useState(false);
  const [saving, setSaving] = useState(false);

  const allMods = useAllModsMap();

  const minVersion = useMinVersion(mod);

  useEffect(() => {
    if (!editMode) {
      setAlternatives(mod?.alternatives ?? []);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mod]);

  const value = useMemo(
    () => alternatives.map(id => allMods?.get(id)).filter(item => !!item),
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
                        dataRegistry?.setModAlternatives(mod, alternatives).then(() => {
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
                  const removedMod = await dataRegistry?.helper.getModByMeta(details.option);
                  setAlternatives(prevValue => prevValue.filter(id => id !== removedMod?.id));
                  return;
                }
                setLoadingMod(details.option);
                dataRegistry?.storeMod(details.option, minVersion).then(mod => {
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
          <Card>
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
                        sx={{
                          paddingLeft: 4,
                          paddingRight: editMode ? 12 : 4,
                          "&:not(:hover) .mcmm-ModListItem__alternatives--empty": {
                            display: "none",
                          },
                        }}
                        {...(editMode
                          ? {
                              link: false,
                              showPlatforms: true,
                              onRemove: async modMeta => {
                                const mod = await dataRegistry?.helper.getModByMeta(modMeta);
                                setAlternatives(list => list.filter(id => id !== mod?.id));
                              },
                            }
                          : {
                              link: item.id,
                              showPlatforms: "link",
                              onClick: () => setModDetailTarget(item.id),
                            })}
                      />
                    </Fragment>
                  );
                })}
                {loadingMod && (
                  <>
                    {alternatives.length > 0 && <Divider />}
                    <ModListItem
                      mod={loadingMod}
                      showPlatforms
                      loading
                      sx={{ paddingLeft: 4, paddingRight: editMode ? 12 : 4 }}
                    />
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
