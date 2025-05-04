import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { HashRouter } from "react-router-dom";

import { ThemeProvider } from "~/theme";
import { App } from "~/components";

import { DataProvider } from "~/context";

// ===================================================

const container = document.getElementById("root");
if (!container) {
  throw new Error(
    `ERROR: Failed to find root container to mount React app; check index.html`,
  );
}

const root = createRoot(container);

// ===================================================

const renderApp = (node: React.ReactNode) => {
  if (import.meta.env.DEV) {
    root.render(<StrictMode>{node}</StrictMode>);
  } else {
    root.render(node);
  }
};

renderApp(
  <ThemeProvider>
    <DataProvider>
      <HashRouter>
        <App />
      </HashRouter>
    </DataProvider>
  </ThemeProvider>,
);
