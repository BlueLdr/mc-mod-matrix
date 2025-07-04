import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import Divider from "@mui/material/Divider";
import Grid from "@mui/material/Grid";
import Skeleton from "@mui/material/Skeleton";

const breakpointWithNav = <T extends object>(styles: T) => ({
  ["@media (max-width: 1338px)"]: styles,
});
const breakpointWithoutNav = <T extends object>(styles: T) => ({
  ["@media (max-width: 1018px)"]: styles,
});

export type ModpackDetailPageHeaderLoadingProps = { navOpen?: boolean };

export function ModpackDetailPageHeaderLoading({ navOpen }: ModpackDetailPageHeaderLoadingProps) {
  return (
    <Box
      sx={theme => ({
        padding: theme.spacing(4),
        paddingBottom: 0,
        margin: theme.spacing(-4),
        marginBottom: 0,
      })}
    >
      <Grid
        container
        display="grid"
        mb={6}
        spacing={1}
        gridTemplateColumns="1fr auto"
        gridTemplateRows="repeat(auto-fill, auto)"
        sx={{
          ...(navOpen ? breakpointWithNav : breakpointWithoutNav)({
            gridTemplateColumns: "1fr",
          }),
        }}
      >
        <Grid container alignItems="center" flexWrap="wrap">
          <Grid container alignItems="center" spacing={2}>
            <Skeleton variant="rounded" sx={{ height: "2.125rem", width: "12rem", mr: 2, my: 1 }} />
            <Grid container spacing={2}>
              {new Array(3).fill(undefined).map((_, i) => (
                <Skeleton key={i} variant="rounded" sx={{ borderRadius: 999 }}>
                  <Chip label="Loading..." />
                </Skeleton>
              ))}
            </Grid>
          </Grid>
        </Grid>
        <Skeleton width="16rem" sx={{ fontSize: "1rem" }} />
      </Grid>
      <Divider />
    </Box>
  );
}
