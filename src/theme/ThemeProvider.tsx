import { ThemeProvider as MuiThemeProvider } from "@mui/material/styles";

import { MuiTheme } from "./Theme";

import GlobalStyles from "@mui/material/GlobalStyles";

import type { WithChildren } from "~/utils";

// import { Theme } from "./Theme";

const useGlobalStyles = (
  <GlobalStyles
    styles={{
      html: {
        height: "100%",
      },
      body: {
        margin: 0,
        height: "100%",
        WebkitFontSmoothing: "antialiased",
        MozOsxFontSmoothing: "grayscale",
      },
      "#root": {
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        minHeight: "100vh",
      },
    }}
  />
);

/*
  This is a higher order component, that will wrap another component
  and expose the MUI Theme object.

  Example:
    const AppWithTheme = withThemeProvider(App);
    export default AppWithTheme
*/
export const ThemeProvider: React.FC<WithChildren> = ({ children }) => (
  <MuiThemeProvider theme={MuiTheme}>
    {useGlobalStyles}
    {children}
  </MuiThemeProvider>
);
