import { ModListLoading, ModMatrixLoading } from "~/components";

import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardHeader from "@mui/material/CardHeader";
import Grid from "@mui/material/Grid";
import Skeleton from "@mui/material/Skeleton";
import Typography from "@mui/material/Typography";

//================================================

export type ModpackMatrixContentLoadingProps = { info?: React.ReactNode };

export function ModpackMatrixContentLoading({ info }: ModpackMatrixContentLoadingProps) {
  return (
    <Grid container direction="column" spacing={4} mt={6}>
      <Grid
        container
        spacing={8}
        justifyContent="space-between"
        sx={{ height: theme => theme.spacing(9) }}
      >
        <Typography variant="h6">Mod support matrix</Typography>
        {info}
      </Grid>
      <Grid container spacing={4} maxWidth="100%" flexWrap="wrap" flexDirection="column">
        <Grid
          flex="1 0 0"
          maxWidth="100%"
          minWidth="100%"
          display="grid"
          gridTemplateColumns="minmax(0, 1fr)"
        >
          <ModMatrixLoading fitWidth />
        </Grid>
        <Grid
          container
          display="grid"
          spacing={4}
          gridTemplateColumns="repeat(auto-fill, minmax(320px, 1fr))"
          gridAutoRows="minmax(0, min-content)"
          maxWidth="100%"
        >
          {new Array(4).fill(undefined).map((_, i) => (
            <Card
              key={i}
              sx={{
                maxWidth: "100%",
                "& .MuiPaper-root": {
                  backgroundColor: theme => theme.palette.background.layer,
                },
              }}
            >
              <CardHeader title={<Skeleton width="12rem" />} />
              <CardContent>
                <Grid container direction="column" spacing={4}>
                  <Typography variant="body1">
                    <Skeleton />
                  </Typography>
                  <Grid container direction="column" spacing={2} maxWidth="100%">
                    <Grid container spacing={2} alignItems="center" justifyContent="space-between">
                      <Grid container spacing={2} alignItems="center" height="2rem">
                        <Typography variant="body1">
                          <Skeleton width="9rem" />
                        </Typography>
                        <Typography variant="overline">
                          <Skeleton sx={{ width: "1rem", fontSize: "0.5rem" }} />
                        </Typography>
                      </Grid>
                    </Grid>
                    <ModListLoading count={2 * i + 2} scale={0.6} sx={{ maxWidth: "100%" }} />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          ))}
        </Grid>
      </Grid>
    </Grid>
  );
}
