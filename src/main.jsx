import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
import { LanguageProvider } from "./i18n/LanguageProvider";
import { AuthProvider } from "./context/AuthContext";
import { NotificationProvider } from "./context/NotificationProvider";
import { HealthProvider } from "./context/HealthProvider";

createRoot(document.getElementById("root")).render(
  <LanguageProvider>
    <AuthProvider>
      <NotificationProvider>
        <HealthProvider>
          <App />
        </HealthProvider>
      </NotificationProvider>
    </AuthProvider>
  </LanguageProvider>
);
