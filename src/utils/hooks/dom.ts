import { useCallback, useEffect, useMemo, useState } from "react";

//================================================
/**
 * Provides a flag and utility functions for opening and closing a modal (or
 * any component that uses the same behavior)
 * @param [initialOpen=false] If `true`, the modal will be open on initial render
 */
export const useModalToggle = (initialOpen = false) => {
  const [open, setOpen] = useState(initialOpen);
  const openModal = useCallback(() => setOpen(true), []);
  const closeModal = useCallback(() => setOpen(false), []);
  return [open, openModal, closeModal] as const;
};

export const useModalTarget = <T>(target?: T) => {
  const [open, setOpen] = useState(!!target);
  const [storedTarget, setStoredTarget] = useState(target);

  useEffect(() => {
    if (target) {
      setStoredTarget(target);
    }
    setOpen(!!target);
  }, [target]);

  const TransitionProps = useMemo(() => {
    return !!storedTarget
      ? {
          onExited: () => setStoredTarget(undefined),
        }
      : undefined;
  }, [storedTarget]);

  return [open, storedTarget, TransitionProps] as const;
};
