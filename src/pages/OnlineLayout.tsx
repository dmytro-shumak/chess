import { Outlet } from "react-router-dom";
import { OnlineRuntimeProvider } from "../online/OnlineRuntimeContext";

export default function OnlineLayout() {
  return (
    <OnlineRuntimeProvider>
      <Outlet />
    </OnlineRuntimeProvider>
  );
}
