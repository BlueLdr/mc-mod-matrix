"use client";

import { CommonModsModal } from "./CommonModsModal";
import { DataBackupModal } from "./DataBackupModal";

import Accordion from "@mui/material/Accordion";
import AccordionDetails from "@mui/material/AccordionDetails";
import AccordionSummary from "@mui/material/AccordionSummary";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import ArrowDropDown from "@mui/icons-material/ArrowDropDown";
import Settings from "@mui/icons-material/Settings";

//================================================

export function ManageDataMenu() {
  return (
    <ListItem>
      <Accordion
        variant="outlined"
        sx={{
          border: "none",
          borderRadius: 0,
        }}
      >
        <AccordionSummary
          component={ListItemButton}
          expandIcon={<ArrowDropDown />}
          sx={{
            "&, &.Mui-expanded": {
              minHeight: theme => theme.spacing(12),
            },
            "& .MuiAccordionSummary-content": {
              display: "flex",
              alignItems: "center",
              gap: theme => theme.spacing(2),
              "&, &.Mui-expanded": {
                margin: 0,
              },
            },
          }}
        >
          <ListItemIcon sx={{ minWidth: "auto" }}>
            <Settings />
          </ListItemIcon>
          <ListItemText>Manage data</ListItemText>
        </AccordionSummary>
        <AccordionDetails
          sx={{
            backgroundColor: theme => theme.palette.background.layer,
          }}
        >
          <List
            dense
            sx={{
              "& .MuiListItemIcon-root": {
                minWidth: "auto",
                marginRight: theme => theme.spacing(4),
              },
            }}
          >
            <CommonModsModal />
            <DataBackupModal />
          </List>
        </AccordionDetails>
      </Accordion>
    </ListItem>
  );
}
