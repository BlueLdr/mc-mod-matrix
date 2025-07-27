"use client";

import { startTransition, useRef, useState } from "react";

import { Modal } from "~/components";
import { useDataExport } from "~/data-utils";
import { DATA_EXPORT_TYPE_MARKER } from "~/utils";

import Alert from "@mui/material/Alert";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import Grid from "@mui/material/Grid";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Settings from "@mui/icons-material/Settings";
import Typography from "@mui/material/Typography";
import ErrorIcon from "@mui/icons-material/Error";

import type { AppDataExport } from "~/data-utils/useDataExport/types";

//================================================

const generateFilename = () => `mc-mod-matrix-data-export-${new Date().toISOString()}.json`;

export function ManageDataModal() {
  const [open, setOpen] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [importPending, setImportPending] = useState(false);
  const [error, setError] = useState<Error>();
  const manager = useDataExport();

  const exportData = async () => {
    const data = await manager?.exportAllData();
    if (!data) {
      return;
    }

    const str = JSON.stringify({ ...data, type: DATA_EXPORT_TYPE_MARKER });
    const bytes = new TextEncoder().encode(str);
    const blob = new Blob([bytes], {
      type: "application/json;charset=utf-8",
    });

    const a = document.createElement("a");
    a.href = window.URL.createObjectURL(blob);
    a.download = generateFilename();
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  const importData = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.length) {
      const file = e.target.files[0];
      file
        .text()
        .then(str => {
          try {
            const parsedData = JSON.parse(str);
            if (typeof parsedData !== "object" || parsedData?.type !== DATA_EXPORT_TYPE_MARKER) {
              setError(new Error("The file you selected is not a valid exported data file."));
              return;
            }
            const { type, ...data } = parsedData as AppDataExport & { type: string };
            setImportPending(true);
            const { promise, resolve, reject } = Promise.withResolvers();
            startTransition(() => manager?.resetAndImportData(data).then(resolve).catch(reject));
            return promise;
          } catch (e) {
            setError(
              e instanceof Error
                ? e
                : new Error(
                    e && typeof e === "string"
                      ? e
                      : "Something went wrong while reading the selected file.",
                  ),
            );
          }
        })
        .finally(() => {
          formRef.current?.reset();
        });
    } else {
      setError(new Error("No file selected"));
    }
  };

  return (
    <>
      <ListItem>
        <ListItemButton onClick={() => setOpen(true)}>
          <ListItemIcon>
            <Settings />
          </ListItemIcon>
          <ListItemText>Manage data</ListItemText>
        </ListItemButton>
      </ListItem>
      <Modal
        id="manage-data-modal"
        open={open}
        onClose={() => {
          if (importPending) {
            return;
          }
          setOpen(false);
          setError(undefined);
        }}
        titleText="Manage data"
      >
        {importPending ? (
          <Grid
            container
            sx={{ width: theme => theme.spacing(40) }}
            alignItems="center"
            justifyContent="center"
            spacing={2}
          >
            <CircularProgress variant="indeterminate" size={48} />
            <Typography variant="body2" align="center">
              Please wait while the data is imported...
            </Typography>
          </Grid>
        ) : (
          <Grid
            container
            spacing={4}
            component="form"
            onSubmit={e => e.preventDefault()}
            ref={formRef}
          >
            <Button
              variant="contained"
              type="button"
              onClick={() => {
                setError(undefined);
                inputRef.current?.click();
              }}
            >
              Import data
            </Button>
            <Button variant="contained" type="button" onClick={exportData}>
              Export data
            </Button>
            <input
              style={{ display: "none" }}
              ref={inputRef}
              type="file"
              onChange={importData}
              accept="application/json"
            />
          </Grid>
        )}
        {error && (
          <Alert icon={<ErrorIcon />} severity="error">
            {error.message}
          </Alert>
        )}
      </Modal>
    </>
  );
}
