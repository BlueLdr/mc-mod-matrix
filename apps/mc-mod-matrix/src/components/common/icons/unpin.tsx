"use client";

import { forwardRef } from "react";

import SvgIcon from "@mui/material/SvgIcon";

import type { SvgIconProps } from "@mui/material/SvgIcon";

//================================================

export type UnpinIconProps = SvgIconProps;

function UnpinIcon(props: UnpinIconProps, ref: React.ForwardedRef<SVGSVGElement>) {
  return (
    <SvgIcon {...props} ref={ref}>
      <svg
        className="MuiSvgIcon-root MuiSvgIcon-fontSizeMedium mui-4uxqju-MuiSvgIcon-root"
        focusable="false"
        aria-hidden="true"
        viewBox="0 0 24 24"
        data-testid="PushPinOffIcon"
      >
        <defs>
          <mask id="cross" width="24" height="24">
            <rect height="24" width="24" x="0" y="0" fill="white" />
            <path d="M18.73 21L18.73 21 20 19.73 3.27 3 2 4.27z" fill="black" />
            <path
              d="M18.73 21L18.73 21 20 19.73 3.27 3 2 4.27z"
              transform="translate(1.27, -1.27)"
              fill="black"
            />
          </mask>
        </defs>
        <path d="M18.73 21L18.73 21 20 19.73 3.27 3 2 4.27z" />
        <path
          fillRule="evenodd"
          mask="url(#cross)"
          d="M16 9V4h1c.55 0 1-.45 1-1s-.45-1-1-1H7c-.55 0-1 .45-1 1s.45 1 1 1h1v5c0 1.66-1.34 3-3 3v2h5.97v7l1 1 1-1v-7H19v-2c-1.66 0-3-1.34-3-3z"
        />
      </svg>
    </SvgIcon>
  );
}

export default forwardRef(UnpinIcon);
