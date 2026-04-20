import "./App.css";
import { Routes, Route, Navigate } from "react-router-dom";
import HomePage from "./pages/HomePage";
import LocalGamePage from "./pages/LocalGamePage";
import ComputerGamePage from "./pages/ComputerGamePage";
import OnlineLayout from "./pages/OnlineLayout";
import OnlineRoomLayout from "./pages/OnlineRoomLayout";
import OnlineLobbyPage from "./pages/OnlineLobbyPage";
import OnlineRoomPage from "./pages/OnlineRoomPage";
import OnlinePlayPage from "./pages/OnlinePlayPage";
import { ROUTES } from "./routes";

export default function App() {
  return (
    <Routes>
      <Route path={ROUTES.home} element={<HomePage />} />
      <Route path={ROUTES.local} element={<LocalGamePage />} />
      <Route path={ROUTES.vsComputer} element={<ComputerGamePage />} />
      <Route path={ROUTES.online} element={<OnlineLayout />}>
        <Route index element={<OnlineLobbyPage />} />
        <Route element={<OnlineRoomLayout />}>
          <Route path="room/:roomId" element={<OnlineRoomPage />} />
          <Route path="play/:roomId" element={<OnlinePlayPage />} />
        </Route>
      </Route>
      <Route path="*" element={<Navigate to={ROUTES.home} replace />} />
    </Routes>
  );
}
