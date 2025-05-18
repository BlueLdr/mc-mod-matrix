"use client";

import { useContext } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";

import { useStorageState } from "~/utils";
import { CreatePackModalContext, DataContext } from "~/context";

import { CreatePackModal } from "./CreatePackModal";

import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import Add from "@mui/icons-material/Add";
import Divider from "@mui/material/Divider";
import ListItemButton from "@mui/material/ListItemButton";
import Button from "@mui/material/Button";
import Drawer from "@mui/material/Drawer";
import Grid from "@mui/material/Grid";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import Typography from "@mui/material/Typography";
import ArrowBack from "@mui/icons-material/ArrowBack";
import Menu from "@mui/icons-material/Menu";

//================================================

const NAV_DRAWER_OPEN_STORAGE_KEY = "nav-drawer-open";

export function NavDrawer() {
  const params = useParams<{ name: string }>();
  const { packs } = useContext(DataContext);
  const [open, setOpen] = useStorageState(NAV_DRAWER_OPEN_STORAGE_KEY, true);
  const { setOpen: setCreateModalOpen } = useContext(CreatePackModalContext);

  return (
    <>
      {!open && (
        <Box position="fixed" top={8} left={8}>
          <IconButton onClick={() => setOpen(true)} size="small">
            <Menu />
          </IconButton>
        </Box>
      )}
      <Drawer
        open={open}
        onClose={() => setOpen(false)}
        variant="persistent"
        anchor="left"
        sx={theme => ({
          transitionProperty: "width, transform, left",
          transitionDuration: `${theme.transitions.duration.leavingScreen}ms`,
          transitionTimingFunction: theme.transitions.easing.easeOut,
        })}
        slotProps={{
          paper: {
            sx: { width: "20rem" },
          },
        }}
        style={{ width: open ? "20rem" : "0rem" }}
      >
        <Grid container padding={4} justifyContent="space-between">
          <Typography variant="h5">MC Mod Matrix</Typography>
          <IconButton onClick={() => setOpen(false)}>
            <ArrowBack />
          </IconButton>
        </Grid>
        <Divider />
        <Grid container padding={4} spacing={8} justifyContent="space-between" alignItems="center">
          <Typography variant="h6" fontWeight="600">
            My Packs
          </Typography>
          <Button
            size="small"
            startIcon={<Add />}
            variant="contained"
            onClick={() => setCreateModalOpen(true)}
          >
            Create new pack
          </Button>
        </Grid>
        <List>
          {packs.map(pack => (
            <ListItem key={pack.name} disablePadding>
              <ListItemButton
                selected={pack.name === decodeURIComponent(params.name ?? "")}
                component={Link}
                href={`/${encodeURIComponent(pack.name)}`}
              >
                {pack.name}
              </ListItemButton>
            </ListItem>
          ))}
        </List>
        <CreatePackModal />
      </Drawer>
    </>
  );
}
