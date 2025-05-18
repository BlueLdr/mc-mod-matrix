import { ModMatrix } from "~/components";

import Typography from "@mui/material/Typography";
import Grid from "@mui/material/Grid";

import type { Modpack } from "@mcmm/data";

//================================================

export type ModpackMatrixPageContentProps = { pack: Modpack };

export function ModpackMatrixPageContent({ pack }: ModpackMatrixPageContentProps) {
  return (
    <Grid container direction="column" spacing={4} mt={6}>
      <Grid>
        <Typography variant="h6">Mod support matrix</Typography>
        <Typography variant="body2">Total mods: {pack.mods.length}</Typography>
      </Grid>
      <ModMatrix pack={pack} />
    </Grid>
  );
}
