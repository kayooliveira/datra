import { createRootRoute, Outlet } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/router-devtools";
import { useSettings } from "../contexts/settings-context";
import { useTranslation } from "react-i18next";
import { EventsOn } from "../../wailsjs/runtime/runtime";
import { useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";

export const Route = createRootRoute({
  component: () => <RootLayout />,
});

function RootLayout() {
  const { platformModifier } = useSettings();
  const { t } = useTranslation();
  const navigate = useNavigate();

  useEffect(() => {
    const unbind = EventsOn("open-settings", () => {
      navigate({ to: "/settings" });
    });

    return () => unbind();
  }, [navigate]);

  const handleRefresh = () => {
    window.location.reload();
  };

  return (
    <div className="app-container">
      <main>
        <Outlet />
      </main>
      <footer>
        <span>
          <button
            onClick={handleRefresh}
            style={{
              background: "none",
              border: "none",
              color: "inherit",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              padding: 0,
              font: "inherit",
            }}
          >
            {t("app.footer.refresh")}
          </button>
        </span>
        <span>
          {platformModifier} + N {t("app.footer.new_connection")}
        </span>
        <span>
          {platformModifier} + O {t("app.footer.open_file")}
        </span>
      </footer>
      <TanStackRouterDevtools />
    </div>
  );
}
