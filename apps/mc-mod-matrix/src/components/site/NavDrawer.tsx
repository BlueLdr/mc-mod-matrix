"use client";

import { useContext } from "react";

import { ModPackList } from "~/components";
import { NAV_DRAWER_OPEN_STORAGE_KEY, useStorageState } from "~/utils";
import { CreatePackModalContext } from "~/context";

import { CreatePackModal } from "./CreatePackModal";
import { ManageDataModal } from "./ManageDataModal";
import { DataRefreshIndicator } from "./DataRefreshIndicator";

import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import Add from "@mui/icons-material/Add";
import Divider from "@mui/material/Divider";
import Button from "@mui/material/Button";
import Drawer from "@mui/material/Drawer";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import ArrowBack from "@mui/icons-material/ArrowBack";
import Menu from "@mui/icons-material/Menu";

//================================================

export type NavDrawerProps = { initialOpen?: boolean };

export function NavDrawer({ initialOpen = true }: NavDrawerProps) {
  const { setOpen: setCreateModalOpen } = useContext(CreatePackModalContext);
  const [open, setOpen] = useStorageState(NAV_DRAWER_OPEN_STORAGE_KEY, initialOpen);

  const setDrawerOpen = (value: boolean) => {
    setOpen(value);
    fetch("/api/nav", {
      method: "POST",
      body: JSON.stringify({ open: value }),
    });
  };

  return (
    <>
      {!open && (
        <>
          <Box position="fixed" top={8} left={8}>
            <IconButton onClick={() => setDrawerOpen(true)} size="small">
              <Menu />
            </IconButton>
          </Box>
          <Box position="fixed" bottom={12} left={8}>
            <DataRefreshIndicator variant="circular" />
          </Box>
        </>
      )}
      <Drawer
        open={open}
        onClose={() => setDrawerOpen(false)}
        className={`mcmm-NavDrawer mcmm-NavDrawer--${open ? "open" : "closed"}`}
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
        <Grid container padding={4} justifyContent="space-between" alignItems="center">
          <Typography variant="h5">MC Mod Matrix</Typography>
          <IconButton onClick={() => setDrawerOpen(false)}>
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
        <Grid overflow="auto" flexGrow={1}>
          <ModPackList />
        </Grid>
        <ManageDataModal />
        <DataRefreshIndicator />
        <CreatePackModal />
      </Drawer>
    </>
  );
}
