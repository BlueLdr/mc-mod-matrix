"use client";

import { createTheme, unstable_createMuiStrictModeTheme } from "@mui/material/styles";

import { colors } from "./colors";

import ExpandMore from "@mui/icons-material/ExpandMore";

//================================================

/*
  https://github.com/mui-org/material-ui/issues/13394
  https://v4.mui.com/customization/theming/#unstable-createmuistrictmodetheme-options-args-theme
*/
const createMuiThemeForEnvironment =
  process.env.NODE_ENV === "production" ? createTheme : unstable_createMuiStrictModeTheme;

export const MuiTheme = createMuiThemeForEnvironment({
  cssVariables: true,
  spacing: 4,
  palette: {
    mode: "dark",
    common: {
      ...colors,
    },
  },
  typography: {
    htmlFontSize: 16,
    button: {
      fontWeight: 400,
      textTransform: "none",
    },
  },
  components: {
    MuiButtonBase: {
      defaultProps: {
        disableRipple: true,
      },
    },
    MuiButton: {
      defaultProps: {
        disableElevation: true,
      },
    },
    MuiIconButton: {
      defaultProps: {
        disableRipple: true,
      },
    },
    MuiButtonGroup: {
      defaultProps: {
        disableRipple: true,
      },
    },
    MuiFormControl: {
      defaultProps: {
        size: "small",
      },
    },
    MuiTextField: {
      defaultProps: {
        variant: "outlined",
        size: "medium",
      },
    },
    MuiSelect: {
      defaultProps: {
        IconComponent: ExpandMore,
      },
    },
    MuiAutocomplete: {
      defaultProps: {
        size: "medium",
      },
    },
    MuiCard: {
      defaultProps: {
        variant: "outlined",
      },
    },
    MuiList: {
      defaultProps: {
        disablePadding: true,
      },
    },
    MuiListItem: {
      defaultProps: {
        disableGutters: true,
      },
    },
    MuiMenu: {
      defaultProps: {
        PaperProps: {
          variant: "elevation",
          elevation: 8,
        },
        keepMounted: true,
      },
    },
    MuiMenuItem: {
      defaultProps: {
        disableRipple: true,
      },
    },
  },
});

// type Override = Exclude<EntryOf<ComponentsOverrides<Theme>>, undefined>;
// (Object.entries(overrides) as Override[]).forEach(([key, styles]) => {
//   if (!themeCustomization.components) {
//     themeCustomization.components = {};
//   }
//   if (!themeCustomization.components[key]) {
//     themeCustomization.components[key] = {};
//   }
//   themeCustomization.components[key]!.styleOverrides = styles;
// });
