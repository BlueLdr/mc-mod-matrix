import { Fragment, useMemo } from "react";

import { comparator, pluralize } from "@mcmm/utils";
import { ModListItem } from "~/components";

import Card from "@mui/material/Card";
import Divider from "@mui/material/Divider";
import Grid from "@mui/material/Grid";
import List from "@mui/material/List";
import Typography from "@mui/material/Typography";

import type { Mod, ModMetadata, PackSupportMeta } from "@mcmm/data";

//================================================

export type ModpackSupportIssuesListProps = { packSupportMeta: PackSupportMeta, separateAltModsList?: boolean, onClickItem?: (item: Mod, event: React.MouseEvent<HTMLLIElement>) => void };

export function ModpackSupportIssuesList({ packSupportMeta, separateAltModsList, onClickItem }: ModpackSupportIssuesListProps) {

  const supportedCount = packSupportMeta?.supportedMods.length ?? 0;
  const supportedAltCount = packSupportMeta?.supportedAlternativeMods.length ?? 0;
  const totalSupportedCount = supportedCount + supportedAltCount;
  const unsupportedCount = packSupportMeta?.unsupportedMods.length ?? 0;
  const totalModCount = packSupportMeta?.pack.mods.length ?? 0;

  const [altToMainMapping, mainToAltMapping] = useMemo(() => {
    return (
      packSupportMeta?.supportedAlternativeMods?.reduce(
        ([altToMain, mainToAlt], item) => {
          const mainMod = packSupportMeta.pack.mods.find(mod =>
            mod.alternatives?.some(alt => alt.slug === item.slug),
          );
          if (mainMod) {
            mainToAlt[mainMod.meta.slug] = item;
            altToMain[item.slug] = mainMod;
          }
          return [altToMain, mainToAlt];
        },
        [{} as Record<string, Mod>, {} as Record<string, ModMetadata>],
      ) ?? [{}, {}]
    );
  }, [packSupportMeta?.pack.mods, packSupportMeta?.supportedAlternativeMods]);

  const unsupportedMods = packSupportMeta?.unsupportedMods
    ?.slice()
    ?.sort(comparator("asc", item => (mainToAltMapping[item.meta.slug] ? 1 : -1)));

  return (
        <Grid container direction="column" spacing={4}>
          {unsupportedCount > 0 ? (
            <Typography variant="body1">
              {totalSupportedCount} of {totalModCount}{" "}
              {pluralize(
                "mod",
                packSupportMeta.supportedMods.length +
                packSupportMeta.supportedAlternativeMods.length,
              )}{" "}
              supported
              {packSupportMeta.supportedAlternativeMods.length
                ? ` (${packSupportMeta.supportedAlternativeMods.length} ${pluralize("alternative", packSupportMeta.supportedAlternativeMods.length)} used)`
                : ""}
            </Typography>
          ) : (
            <Grid container alignItems="center" justifyContent="center" height="16rem">
              All mods are supported for this version!
            </Grid>
          )}
          {unsupportedCount > 0 && (
            <Grid container direction="column" spacing={2}>
              <Grid container spacing={2} alignItems="center" justifyContent="space-between">
                <Grid container spacing={2} alignItems="center">
                  <Typography variant="body1">Unsupported Mods</Typography>
                  <Typography variant="overline">{unsupportedCount}</Typography>
                </Grid>
                {!separateAltModsList && supportedAltCount > 0 && (
                  <Typography variant="caption">Alternative</Typography>
                )}
              </Grid>

              <Card variant="outlined" sx={{ paddingInline: 4 }}>
                <List>
                  {unsupportedMods?.map((item, index) => (
                    <Fragment key={item.meta.slug}>
                      {index > 0 && <Divider />}
                      <ModListItem
                        sx={
                          mainToAltMapping[item.meta.slug]
                            ? {
                              fontStyle: mainToAltMapping[item.meta.slug] ? "italic" : undefined,
                              color: theme => theme.palette.text.disabled,
                            }
                            : undefined
                        }
                        key={item.meta.slug}
                        mod={item.meta}
                        contentRight={
                          !separateAltModsList && mainToAltMapping[item.meta.slug] ? (
                            <Typography fontStyle="normal" variant="caption" color="textPrimary">
                              {mainToAltMapping[item.meta.slug].name}
                            </Typography>
                          ) : undefined
                        }
                        // onRemove={mod => setAlternatives(list => list.filter(m => m.slug !== mod.slug))}
                      />
                    </Fragment>
                  ))}
                </List>
              </Card>
            </Grid>
          )}
          {supportedAltCount > 0 && separateAltModsList && (
            <Grid container direction="column" spacing={2}>
              <Grid container spacing={2} alignItems="center">
                <Typography variant="body1">Alternative Mods</Typography>
                <Typography variant="overline">{supportedAltCount}</Typography>
              </Grid>

              <Card variant="outlined" sx={{ paddingInline: 4 }}>
                <List>
                  {packSupportMeta.supportedAlternativeMods.map((item, index) => (
                    <Fragment key={item.slug}>
                      {index > 0 && <Divider />}
                      <ModListItem
                        key={item.slug}
                        mod={item}
                        contentRight={
                          <Typography variant="caption" color="textDisabled">
                            {altToMainMapping?.[item.slug]?.name}
                          </Typography>
                        }
                        // onRemove={mod => setAlternatives(list => list.filter(m => m.slug !== mod.slug))}
                      />
                    </Fragment>
                  ))}
                </List>
              </Card>
            </Grid>
          )}
        </Grid>
  );
}
