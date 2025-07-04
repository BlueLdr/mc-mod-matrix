"use client";

import { createTheme, unstable_createMuiStrictModeTheme } from "@mui/material/styles";

import { createSizes } from "./sizes";
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
    ...colors,
  },
  typography: {
    htmlFontSize: 16,
    button: {
      fontWeight: 400,
      textTransform: "none",
    },
  },
  components: {
    MuiTooltip: {
      defaultProps: {
        arrow: true,
        placement: "top",
        enterDelay: 500,
      },
    },
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
        slotProps: {
          paper: {
            variant: "elevation",
            elevation: 8,
          },
        },
        keepMounted: true,
      },
    },
    MuiMenuItem: {
      defaultProps: {
        disableRipple: true,
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: ({ theme }) => ({
          background: theme.palette.background.paper,
        }),
      },
    },
    MuiDialogTitle: {
      styleOverrides: {
        root: ({ theme }) => ({
          backgroundColor: theme.palette.background.layer,
        }),
      },
    },
    MuiDialogContent: {
      styleOverrides: {
        root: ({ theme }) => ({
          "& .MuiPaper-root": {
            background: theme.palette.background.layer,
          },
        }),
      },
    },
    MuiSkeleton: {
      defaultProps: {
        animation: "wave",
      },
    },
  },
});

MuiTheme.sizes = createSizes(MuiTheme);

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
