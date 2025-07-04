import { AppRouterCacheProvider } from "@mui/material-nextjs/v15-appRouter";
import { Roboto } from "next/font/google";

import { ThemeProvider } from "~/theme";
import { SiteLayout } from "~/components";

import type { Metadata } from "next";

//================================================

const roboto = Roboto({
  weight: ["300", "400", "500", "700"],
  subsets: ["latin"],
  display: "swap",
  variable: "--font-roboto",
});

//================================================

export const metadata: Metadata = {
  title: {
    default: "MC Mod Matrix",
    template: "%s | MC Mod Matrix",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={roboto.variable} suppressHydrationWarning>
      <body>
        <div id="root">
          <AppRouterCacheProvider>
            <ThemeProvider>
              <SiteLayout>{children}</SiteLayout>
            </ThemeProvider>
          </AppRouterCacheProvider>
        </div>
      </body>
    </html>
  );
}
