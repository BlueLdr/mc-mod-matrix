import { useParams } from "react-router-dom";

import Container from "@mui/material/Container";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";

//================================================

export function NotFound() {
  const { name } = useParams();

  return (
    <Container maxWidth="md">
      <Grid
        container
        alignItems="center"
        justifyContent="center"
        flexDirection="column"
        flexGrow={1}
        width="100%"
        height="100vh"
      >
        <Typography variant="h6">Pack not found</Typography>
        <Typography variant="body2">
          Could not find a pack with name "{name}"
        </Typography>
      </Grid>
    </Container>
  );
}
