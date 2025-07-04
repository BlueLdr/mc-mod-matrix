import { AppRouterCacheProvider } from "@mui/material-nextjs/v15-appRouter";
import { Roboto } from "next/font/google";
import { cookies } from "next/headers";

import { ThemeProvider } from "~/theme";
import { SiteLayout } from "~/components";
import { NAV_DRAWER_OPEN_STORAGE_KEY } from "~/utils";

import CssBaseline from "@mui/material/CssBaseline";

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

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const initialNavOpen = `${cookieStore.get(NAV_DRAWER_OPEN_STORAGE_KEY)?.value}` === "true";

  return (
    <html lang="en" className={roboto.variable} suppressHydrationWarning>
      <body suppressHydrationWarning>
        <div id="root">
          <AppRouterCacheProvider>
            <ThemeProvider>
              <CssBaseline />
              <SiteLayout initialNavOpen={initialNavOpen}>{children}</SiteLayout>
            </ThemeProvider>
          </AppRouterCacheProvider>
        </div>
      </body>
    </html>
  );
}
