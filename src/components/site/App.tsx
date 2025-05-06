import { Route, Routes } from "react-router-dom";

import { HomePage, ModpackDetailPage } from "~/components/routes";
import SiteLayout from "./SiteLayout.tsx";

//================================================

function App() {
  return (
    <Routes>
      <Route element={<SiteLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/:name" element={<ModpackDetailPage />} />
      </Route>
    </Routes>
  );
}

export default App;
