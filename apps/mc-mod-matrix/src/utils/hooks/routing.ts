"use client";

import { useParams, usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useRef } from "react";

import { useModalTarget, useValueRef } from "~/utils";

import type { ReadonlyURLSearchParams } from "next/navigation";
import type { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";
import type { ModalProps } from "~/components";

//================================================

export const useRoutedModal = <T>(
  getTarget: (params: Record<string, any>, searchParams: ReadonlyURLSearchParams) => T,
  native?: boolean,
  closeHandler?: (
    params: Record<string, any>,
    searchParams: ReadonlyURLSearchParams,
    router: AppRouterInstance,
  ) => void,
) => {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const target = getTarget(params, searchParams);
  const closeCalled = useRef(false);

  const [open, modalTarget, transitionProps] = useModalTarget(target || undefined);

  useEffect(() => {
    if (!open) {
      closeCalled.current = false;
    }
  }, [open]);

  const closeDialog = useCallback(() => {
    if (open && !closeCalled.current) {
      closeCalled.current = true;
      if (closeHandler) {
        closeHandler(params, searchParams, router);
      } else if (native) {
        window.history.back();
      } else {
        router.back();
      }
    }
  }, [closeHandler, native, open, params, router, searchParams]);

  const dialogProps: Pick<ModalProps, "onClose" | "open" | "slotProps"> = {
    open,
    onClose: closeDialog,
    slotProps: {
      transition: transitionProps,
    },
  };

  return [open, modalTarget, dialogProps, closeDialog] as const;
};

//================================================

export const useSearchParamRoutedModal = <T>(
  paramName: string,
  getTarget: (value: string) => T,
  native?: boolean,
  closeHandler?:
    | ((
        params: Record<string, any>,
        searchParams: ReadonlyURLSearchParams,
        router: AppRouterInstance,
      ) => void)
    | "back",
) => {
  const setSearchParam = useSearchParamSetter(paramName, native);
  const handleClose =
    closeHandler === "back"
      ? undefined
      : closeHandler == null
        ? () => setSearchParam(undefined)
        : closeHandler;

  return useRoutedModal(
    (_, searchParams) => {
      const value = searchParams?.get(paramName);
      return value ? getTarget(value) : undefined;
    },
    native,
    handleClose,
  );
};

//================================================

export const useSearchParamSetter = (paramName: string, native = true) => {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();

  const searchParamsRef = useValueRef(searchParams);
  const pathnameRef = useValueRef(pathname);

  return useCallback(
    (value: string | undefined) => {
      const allParams = new URLSearchParams(searchParamsRef.current.toString());
      if (value != null) {
        allParams.set(paramName, value);
      } else {
        allParams.delete(paramName);
      }
      const newParamsStr = allParams.toString();
      const newPathname = native
        ? newParamsStr.length
          ? ""
          : window.location.pathname
        : pathnameRef.current;
      const newUrl = `${newPathname}${newParamsStr.length ? "?" : ""}${newParamsStr}`;
      if (native) {
        window.history.pushState(undefined, "", newUrl);
      } else {
        router.push(newUrl);
      }
    },
    [searchParamsRef, paramName, native, pathnameRef, router],
  );
};
