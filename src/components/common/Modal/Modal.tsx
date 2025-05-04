import styled from "@emotion/styled";
import * as React from "react";

import { classNameWithModifiers, classNames } from "~/utils";

import CloseIcon from "@mui/icons-material/Close";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Grid from "@mui/material/Grid";
import IconButton from "@mui/material/IconButton";

import type { StyleProps } from "~/theme";
import type { ModalProps } from "./types";

//================================================

const headerStyle: StyleProps = {
  backgroundColor: theme => theme.palette.grey["800"],
  borderBottom: theme => `1px solid ${theme.palette.grey["600"]}`,
  marginBottom: theme => theme.spacing(4),
};

const CloseButton = styled(IconButton)`
  padding: ${({ theme }) => theme.spacing(2)};
  margin: ${({ theme }) => theme.spacing(-2, -2, 0, 2)};
`;
CloseButton.displayName = "CloseButton";

//================================================

export const Modal: React.FC<ModalProps> = ({
  open,
  onClose,
  children,
  titleText,
  maxWidth = "md",
  fullWidth = false,
  className,
  hideCloseButton,
  id,
  confirmButton: confirmButtonProp,
  cancelButton: cancelButtonProp,
  ...props
}) => {
  const cancelButton = cancelButtonProp
    ? React.cloneElement(cancelButtonProp, {
        name: "cancel-button",
        variant: "outlined",
        ...cancelButtonProp.props,
        onClick: cancelButtonProp.props?.disabled
          ? undefined
          : cancelButtonProp.props?.onClick ?? onClose,
      })
    : undefined;

  const confirmButton = confirmButtonProp
    ? React.cloneElement(confirmButtonProp, {
        name: "confirm-button",
        variant: "contained",
        ...confirmButtonProp.props,
        onClick: confirmButtonProp.props?.disabled
          ? undefined
          : confirmButtonProp.props?.onClick,
      })
    : undefined;

  return (
    <Dialog
      {...props}
      className={classNames(
        classNameWithModifiers("modal", { "-open": open }),
        className
      )}
      open={open}
      fullWidth={fullWidth}
      maxWidth={maxWidth}
      onClose={onClose}
      PaperProps={{
        elevation: 24,
        ...(props.PaperProps ?? {}),
      }}
      id={id}
      aria-labelledby={`${id}-title`}
      aria-describedby={`${id}-description`}
    >
      {(!hideCloseButton || !!titleText) && (
        <DialogTitle
          component="div"
          id={`${id}-title`}
          sx={!!titleText ? headerStyle : undefined}
        >
          <Grid
            container
            justifyContent="space-between"
            alignItems="center"
            spacing={4}
          >
            <Grid item>{titleText}</Grid>
            {!hideCloseButton ? (
              <Grid item sx={{ lineHeight: 0 }}>
                <CloseButton
                  className="modal-close"
                  aria-label="close"
                  onClick={onClose}
                >
                  <CloseIcon />
                </CloseButton>
              </Grid>
            ) : undefined}
          </Grid>
        </DialogTitle>
      )}

      <DialogContent id={`${id}-description`}>{children}</DialogContent>

      {(confirmButton || cancelButton) && (
        <DialogActions>
          <Grid
            container
            alignItems="center"
            justifyContent="flex-end"
            spacing={4}
          >
            {cancelButton && <Grid item>{cancelButton}</Grid>}
            {confirmButton && <Grid item>{confirmButton}</Grid>}
          </Grid>
        </DialogActions>
      )}
    </Dialog>
  );
};
