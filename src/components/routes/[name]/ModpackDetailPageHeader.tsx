import Divider from "@mui/material/Divider";
import { capitalize } from "lodash";
import { useContext } from "react";

import { LoaderIcons } from "~/components";
import { DataContext } from "~/context";

import Chip from "@mui/material/Chip";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";

//================================================

export function ModpackDetailPageHeader() {
  const { currentPack: pack } = useContext(DataContext);
  if (!pack) {
    return null;
  }

  return (
    <>
      <Grid container direction="column" mb={6} spacing={1}>
        <Grid container alignItems="center" spacing={2}>
          <Typography variant="h4" fontWeight={600} pr={2}>
            {pack.name}
          </Typography>
          {pack.loaders.map(loader => {
            const Icon = LoaderIcons[loader];
            return (
              <Chip
                key={loader}
                icon={<Icon size={20} />}
                label={capitalize(loader)}
              />
            );
          })}
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
