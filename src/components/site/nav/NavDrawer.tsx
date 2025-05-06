import { useContext } from "react";
import { Link, useParams } from "react-router-dom";

import { CreatePackModal } from "~/components";
import { CreatePackModalContext, DataContext } from "~/context";

import Add from "@mui/icons-material/Add";
import Divider from "@mui/material/Divider";
import ListItemButton from "@mui/material/ListItemButton";
import Button from "@mui/material/Button";
import Drawer from "@mui/material/Drawer";
import Grid from "@mui/material/Grid";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import Typography from "@mui/material/Typography";

//================================================

export function NavDrawer() {
  const params = useParams();
  console.log(`params: `, params);
  const { packs } = useContext(DataContext);
  const { open, setOpen } = useContext(CreatePackModalContext);

  return (
    <Drawer
      open
      variant="permanent"
      anchor="left"
      sx={{ width: "20rem" }}
      slotProps={{
        paper: {
          sx: { width: "20rem" },
        },
      }}
    >
      <Grid container padding={4}>
        <Typography variant="h5">MC Mod Matrix</Typography>
      </Grid>
      <Divider />
      <Grid
        container
        padding={4}
        spacing={8}
        justifyContent="space-between"
        alignItems="center"
      >
        <Typography variant="h6" fontWeight="600">
          My Packs
        </Typography>
        <Button
          size="small"
          startIcon={<Add />}
          variant="contained"
          onClick={() => setOpen(true)}
        >
          Create new pack
        </Button>
      </Grid>
      <List>
        {packs.map(pack => (
          <ListItem key={pack.name} disablePadding>
            <ListItemButton
              selected={pack.name === params.name}
              component={Link}
              to={`/${encodeURIComponent(pack.name)}`}
            >
              {pack.name}
            </ListItemButton>
          </ListItem>
        ))}
      </List>
      <CreatePackModal open={open} setOpen={setOpen} />
    </Drawer>
  );
}
