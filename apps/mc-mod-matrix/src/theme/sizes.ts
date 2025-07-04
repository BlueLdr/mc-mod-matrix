import type { Theme } from "@mui/material/styles";

// ================================================================

export const createSizes = (theme: Theme) =>
  ({
    siteHeader: {
      height: theme.spacing(15),
    },
    siteNavBar: {
      width: theme.spacing(80),
    },
    tabBar: {
      height: theme.spacing(9.5),
    },
    modDetail: {
      spacing: 4,
      container: {
        ["@media (min-width: 600px)"]: {
          px: 6,
        },
        ["@media (max-width: 599px)"]: {
          px: 4,
        },
      },
      list: {
        minWidth: 400,
        flexBasis: 500,
        flexGrow: 2,
      },
      matrix: {
        minWidth: 440,
        flexBasis: 440,
        flexGrow: 3,
      },
    },
    pageContainer: {
      padding: {
        x: theme.spacing(8),
        y: theme.spacing(4),
      },
    },
    footer: {
      height: theme.spacing(7.5),
    },
    get pageContent() {
      const total = [
        this.siteHeader.height,
        this.tabBar.height,
        this.pageContainer.padding.y,
        this.pageContainer.padding.y,
        this.footer.height,
      ]
        .map(v => Number(v.replace(/(\d+(\.\d+)?)[a-z]+/, "$1")))
        .reduce((sum, v) => sum + v, 0);
      const outerPadding = theme.spacing(total / 4);
      return {
        outerPadding,
        height: `calc(100vh - ${outerPadding})`,
      };
    },
  }) as const;
