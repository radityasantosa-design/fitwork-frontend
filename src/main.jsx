import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
import { LanguageProvider } from "./i18n/LanguageProvider";
import { AuthProvider } from "./context/AuthContext";
import { NotificationProvider } from "./context/NotificationProvider";
import { HealthProvider } from "./context/HealthProvider";
import { DailyStatsProvider } from "./context/DailyStatsProvider";
import { WorkSessionProvider } from "./context/WorkSessionProvider";
import { GazeControlProvider } from "./context/GazeControlProvider";

createRoot(document.getElementById("root")).render(
  <LanguageProvider>
    <AuthProvider>
      <NotificationProvider>
        <HealthProvider>
          <DailyStatsProvider>
            <WorkSessionProvider>
              <GazeControlProvider>
                <App />
              </GazeControlProvider>
            </WorkSessionProvider>
          </DailyStatsProvider>
        </HealthProvider>
      </NotificationProvider>
    </AuthProvider>
  </LanguageProvider>
);
