import { Route, Routes } from "react-router-dom";

import {
  HomePage,
  ModpackDetailPage,
  ModpackDetailPageLayout,
} from "~/components/routes";
import SiteLayout from "./SiteLayout.tsx";

//================================================

function App() {
  return (
    <Routes>
      <Route element={<SiteLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route element={<ModpackDetailPageLayout />}>
          <Route path="/:name" element={<ModpackDetailPage />} />
        </Route>
      </Route>
    </Routes>
  );
}

export default App;
