"use client";

import { capitalize } from "lodash";
// import { usePathname, useRouter } from "next/navigation";
import { useContext } from "react";

import { LoaderIcon } from "~/components";
import { DataContext } from "~/context";

import Divider from "@mui/material/Divider";
// import Tabs from "@mui/material/Tabs";
import Chip from "@mui/material/Chip";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
// import Tab from "@mui/material/Tab";

//================================================

export function ModpackDetailPageHeader() {
  const { currentPack: pack } = useContext(DataContext);
  // const router = useRouter();
  // const isMatrix = usePathname().match(/^\/?[^/]*\/matrix/i);

  if (!pack) {
    return null;
  }

  return (
    <>
      <Grid container direction="column" mb={6} spacing={1}>
        <Grid container alignItems="center" justifyContent="space-between">
          <Grid container alignItems="center" spacing={2}>
            <Typography variant="h4" fontWeight={600} pr={2}>
              {pack.name}
            </Typography>
            {pack.loaders.map(loader => (
              <Chip
                key={loader}
                icon={<LoaderIcon loader={loader} size={20} />}
                label={capitalize(loader)}
              />
            ))}
          </Grid>
          {/*<Tabs
            value={isMatrix ? "matrix" : "detail"}
            onChange={(_, value) =>
              router.push(`/${pack?.name}${value === "matrix" ? "/matrix" : ""}`)
            }
          >
            <Tab value="detail" label="Mods" />
            <Tab value="matrix" label="Matrix" />
          </Tabs>*/}
        </Grid>
        <Typography variant="body1">
          Minecraft{" "}
          <Typography component="span" fontWeight={600}>
            {pack.versions.min} - {pack.versions.max}
          </Typography>{" "}
        </Typography>
      </Grid>
      <Divider />
    </>
  );
}
