import "./App.css";
import { Navigate, Route, Routes } from "react-router-dom";
import ComputerGamePage from "./pages/ComputerGamePage";
import HomePage from "./pages/HomePage";
import LocalGamePage from "./pages/LocalGamePage";
import OnlineLayout from "./pages/OnlineLayout";
import OnlineLobbyPage from "./pages/OnlineLobbyPage";
import OnlinePlayPage from "./pages/OnlinePlayPage";
import OnlineRoomLayout from "./pages/OnlineRoomLayout";
import OnlineRoomPage from "./pages/OnlineRoomPage";
import { ONLINE_ROUTES, ROUTES } from "./routes";

export default function App() {
  return (
    <Routes>
      <Route path={ROUTES.home} element={<HomePage />} />
      <Route path={ROUTES.local} element={<LocalGamePage />} />
      <Route path={ROUTES.vsComputer} element={<ComputerGamePage />} />
      <Route path={ROUTES.online} element={<OnlineLayout />}>
        <Route index element={<OnlineLobbyPage />} />
        <Route element={<OnlineRoomLayout />}>
          <Route path={ONLINE_ROUTES.room} element={<OnlineRoomPage />} />
          <Route path={ONLINE_ROUTES.play} element={<OnlinePlayPage />} />
        </Route>
      </Route>
      <Route path="*" element={<Navigate to={ROUTES.home} replace />} />
    </Routes>
  );
}
