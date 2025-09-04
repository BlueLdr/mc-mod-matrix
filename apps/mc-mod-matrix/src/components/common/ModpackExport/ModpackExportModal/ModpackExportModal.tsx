"use client";

import { capitalize } from "lodash";
import { useContext, useEffect, useState } from "react";

import { downloadBlob } from "@mcmm/utils";
import { Modal, ProgressIndicator } from "~/components";
import { DataRegistryContext, StorageContext } from "~/context";
import { ExportJobHandler, JobRequestType, JobType, MessageType, platformManager } from "~/data";
import { useBackgroundJobProgress } from "~/data-utils";
import { useModalTarget, useStorageState } from "~/utils";

import { ModpackExportForm } from "./ModpackExportForm";

import Button from "@mui/material/Button";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import Check from "@mui/icons-material/Check";

import type { ModpackExportParams } from "@mcmm/platform";
import type { PackSupportMeta } from "@mcmm/data";

//================================================

const FORM_ID = "export-modpack-form";

export type ModpackExportModalProps = {
  target?: PackSupportMeta;
  closeModal: () => void;
};

export function ModpackExportModal({ target, closeModal }: ModpackExportModalProps) {
  const [open, packSupportMeta, TransitionProps] = useModalTarget(target);
  const { workerApi } = useContext(DataRegistryContext);
  const { updatePack } = useContext(StorageContext);
  const [storedAuthor, setStoredAuthor] = useStorageState<string>("stored-author-name");

  const [params, setParams] = useState<ModpackExportParams>();

  const jobId = params ? ExportJobHandler.getJobIdFromRequest(params) : undefined;
  const [progress, , isRunning] = useBackgroundJobProgress(JobType.Export, d => d, jobId ?? "");

  const onSubmit = (data: ModpackExportParams) => {
    workerApi?.on(
      MessageType.Complete,
      JobType.Export,
      ExportJobHandler.getJobIdFromRequest(data),
      msg => {
        platformManager
          .createModpackZip({
            ...data,
            files: msg.files,
          })
          .then((blob: Blob) =>
            downloadBlob(
              blob,
              data.fileName.endsWith(".zip") ? data.fileName : `${data.fileName}.zip`,
            ),
          );
      },
      { once: true },
    );

    workerApi?.sendRequest({
      type: JobRequestType.StartJob,
      jobType: JobType.Export,
      ...data,
      runImmediately: true,
    });
    setStoredAuthor(data.author);
    setParams(data);
    updatePack({
      ...data.packSupportMeta.pack,
      packVersion: data.version,
    });
  };

  useEffect(() => {
    if (!isRunning && progress?.complete) {
      closeModal();
    }
  }, [closeModal, isRunning, progress?.complete]);

  useEffect(() => {
    if (!packSupportMeta) {
      setParams(undefined);
    }
  }, [packSupportMeta]);

  const currentIndex = progress?.current ?? (progress?.complete ? progress.total : -1);
  const isInProgress = isRunning && !progress?.complete && !progress?.error;

  const onCancel = () => {
    if (isInProgress && params) {
      workerApi?.sendRequest({
        type: JobRequestType.CancelJob,
        jobType: JobType.Export,
        id: ExportJobHandler.getJobIdFromRequest(params),
      });
    } else {
      closeModal();
    }
  };

  return (
    <Modal
      id="export-pack-modal"
      open={open}
      onClose={isInProgress ? () => undefined : closeModal}
      titleText={`Export "${packSupportMeta?.pack?.name}" for ${capitalize(packSupportMeta?.loader)} ${packSupportMeta?.gameVersion}`}
      slotProps={{ transition: TransitionProps }}
    >
      {packSupportMeta && (
        <ModpackExportForm
          packSupportMeta={packSupportMeta}
          formId={FORM_ID}
          onSubmit={onSubmit}
          defaultAuthor={storedAuthor}
          disabled={isInProgress || progress?.complete}
        />
      )}
      {params && (progress?.error || isRunning) && (
        <ProgressIndicator
          value={currentIndex}
          total={progress?.total}
          color={progress?.complete ? "success" : undefined}
          variant="linear"
          labelText={
            progress ? (
              progress.error ? (
                <Typography color="error" variant="inherit">
                  Export failed: {progress.error.message}
                </Typography>
              ) : (
                `Exporting modpack... (${Math.round((currentIndex / progress.total) * 100)}%)`
              )
            ) : (
              "Exporting modpack..."
            )
          }
          paused={progress?.paused}
          error={progress?.error}
        />
      )}
      <Grid container justifyContent="flex-end" alignItems="center" spacing={4} mt={8}>
        <Button variant="outlined" onClick={onCancel}>
          Cancel
        </Button>
        <Button
          type="submit"
          form={FORM_ID}
          loading={isInProgress}
          variant="contained"
          {...(progress?.complete
            ? {
                color: "success",
                sx: { pointerEvents: "none" },
                onClick: (e: React.MouseEvent) => e.preventDefault(),
                children: <Check />,
              }
            : { children: "Export" })}
        />
      </Grid>
    </Modal>
  );
}
