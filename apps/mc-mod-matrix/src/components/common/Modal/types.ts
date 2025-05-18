import type { DialogProps } from "@mui/material/Dialog";
import type { ButtonProps } from "@mui/material/Button";

export interface ModalProps extends DialogProps {
  id: string;
  className?: string;
  open: boolean;
  /**
   * If `true`, the modal will fill the entire width of the viewport (minus
   * margin)
   */
  fullWidth?: boolean;
  /** The preset for the max width of the dialog */
  maxWidth?: "sm" | "md" | "lg" | "xl" | false;
  /** Callback to invoke when the modal is closed */
  onClose: (e?: any, reason?: any) => void;
  children: React.ReactNode;
  /**
   * Confirm button to be displayed in the modal footer; default props will be
   * set by the Modal but can be overridden by providing those props explicitly
   */
  confirmButton?: React.ReactElement<ButtonProps>;
  /**
   * Cancel button to be displayed in the modal footer; default props will be
   * set by the Modal but can be overridden by providing those props explicitly
   */
  cancelButton?: React.ReactElement<ButtonProps>;
  /** Text to display as the modal title */
  titleText?: string;
  /** If `true`, the "X" close button will be hidden */
  hideCloseButton?: boolean;
}

export interface ModalHeaderProps {
  id?: string;
  /** Callback to invoke when the modal is closed */
  onClose?: () => void;
}
