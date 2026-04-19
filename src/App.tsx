import "./App.css";
import { Routes, Route, Navigate } from "react-router-dom";
import HomePage from "./pages/HomePage";
import LocalGamePage from "./pages/LocalGamePage";
import ComputerGamePage from "./pages/ComputerGamePage";
import { ROUTES } from "./routes";

export default function App() {
  return (
    <Routes>
      <Route path={ROUTES.home} element={<HomePage />} />
      <Route path={ROUTES.local} element={<LocalGamePage />} />
      <Route path={ROUTES.vsComputer} element={<ComputerGamePage />} />
      <Route path="*" element={<Navigate to={ROUTES.home} replace />} />
    </Routes>
  );
}
