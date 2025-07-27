"use client";

import { styled } from "@mui/material/styles";
import { useContext, useMemo, useState } from "react";

import { Modal, ModListEditable, ModListLoading } from "~/components";
import { DataContext, DataInitializer, StorageContext } from "~/context";
import { MOD_DETAIL_MODAL_SEARCH_PARAM, useSearchParamSetter } from "~/utils";

import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Repeat from "@mui/icons-material/Repeat";

import type { ModListEditableProps } from "~/components";
import type { Mod } from "@mcmm/data";

//================================================

const StyledModal = styled(Modal)(({ theme }) => ({
  "& .MuiDialog-paper": {
    overflowY: "unset",
    display: "grid",
    gridTemplateColumns: "1fr",
    gridTemplateRows: "auto minmax(0, 1fr) auto",
  },
  "& .MuiDialogContent-root": {
    overflow: "unset",
    flex: "0 1 auto",
    padding: 0,
    display: "grid",
    gridTemplateColumns: "minmax(0, 1fr)",
    gridTemplateRows: "auto minmax(0, 1fr)",
  },
  "& .mcmm-ModListEditable": {
    maxHeight: "100%",
    // display: "flex",
    // flexDirection: "column",
    display: "grid",
    gridTemplateColumns: "1fr",
    gridTemplateRows: "auto auto minmax(0, 1fr)",
  },
  "& .mcmm-ModListEditable__header": {
    flex: "0 0 auto",
    marginInline: theme.spacing(6),
  },
  "& .mcmm-ModListEditable__input": {
    flex: "0 0 auto",
    marginInline: theme.spacing(6),
    marginBottom: theme.spacing(2),
  },
  "& .mcmm-ModListEditable__list": {
    overflowY: "auto",
    flex: "1 1 auto",
    maxHeight: "100%",
    paddingInline: theme.spacing(6),
    "& .MuiPaper-root": {
      marginTop: theme.spacing(2),
    },
  },
}));

//================================================

const COMMON_MODS_FORM_ID = "common-mods-form";

export function CommonModsModal() {
  const { commonMods } = useContext(StorageContext);
  const [open, setOpen] = useState(false);

  return (
    <>
      <ListItem>
        <ListItemButton onClick={() => setOpen(true)}>
          <ListItemIcon>
            <Repeat />
          </ListItemIcon>
          <ListItemText
            slotProps={{
              secondary: {
                variant: "caption",
              },
            }}
            secondary="Manage a set of mods that most or all packs should have"
          >
            Common mods
          </ListItemText>
        </ListItemButton>
      </ListItem>
      <StyledModal
        id="common-mods-modal"
        open={open}
        onClose={() => setOpen(false)}
        titleText="Manage common mods"
        slotProps={{
          paper: {
            sx: theme => ({
              minWidth: "540px",
              [theme.breakpoints.down("sm")]: {
                minWidth: `calc(100vw - ${theme.spacing(8)})`,
              },
            }),
          },
        }}
        cancelButton={<Button>Cancel</Button>}
        confirmButton={
          <Button type="submit" form={COMMON_MODS_FORM_ID}>
            Save
          </Button>
        }
      >
        <Typography mb={3} px={6} minWidth="100%" maxWidth="min-content">
          These mods can be automatically added when creating a new pack. Modifying this list will
          not affect existing modpacks.
        </Typography>
        <DataInitializer
          initialLoadingView={<ModListLoading showPlatforms count={commonMods.length || 5} />}
        >
          <CommonModsEditor editMode={open} setEditMode={setOpen} />
        </DataInitializer>
      </StyledModal>
    </>
  );
}

function CommonModsEditor(props: Pick<ModListEditableProps, "editMode" | "setEditMode">) {
  const { commonMods, setCommonMods } = useContext(StorageContext);
  const { allMods } = useContext(DataContext);
  const setModDetailTarget = useSearchParamSetter(MOD_DETAIL_MODAL_SEARCH_PARAM);

  const items = useMemo(
    () => commonMods.map(id => allMods?.get(id))?.filter(m => !!m),
    [commonMods, allMods],
  );

  const onSave = (mods: Mod[]) => setCommonMods(mods.map(m => m.id));

  return (
    <ModListEditable
      {...props}
      hideHeaderButton
      showPlatforms="link"
      items={items}
      onClickItem={(_, item) => setModDetailTarget(item.id)}
      onSave={onSave}
      formId={COMMON_MODS_FORM_ID}
    />
  );
}
