import Button from "@mui/material/Button";
import Container from "@mui/material/Container";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import { useContext } from "react";
import { CreatePackModalContext } from "~/context";

// ================================================================

export function HomePage() {
  const { setOpen } = useContext(CreatePackModalContext);
  return (
    <Container maxWidth="lg" sx={{ height: "100vh" }}>
      <Grid
        container
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        height="100%"
        spacing={4}
      >
        <Typography variant="body1" color="textSecondary">
          Select a pack from the list, or create a new one.
        </Typography>
        <Button
          variant="outlined"
          color="primary"
          onClick={() => setOpen(true)}
        >
          Create mod pack
        </Button>
      </Grid>
    </Container>
  );
}
