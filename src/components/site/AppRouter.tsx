import { Route, Routes } from "react-router-dom";

import { HomePage, ModpackDetailPage } from "~/components/routes";

export const AppRouter: React.FC = () => (
  <Routes>
    <Route path="/" element={<HomePage />} />
    <Route path="/:id?" element={<ModpackDetailPage />} />
  </Routes>
);
