import { createRootRoute, Outlet } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/router-devtools";
import { useSettings } from "../contexts/settings-context";
import { useTranslation } from "react-i18next";
import { EventsOn } from "../../wailsjs/runtime/runtime";
import { useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Layout, Panel, Group as PanelGroup } from "react-resizable-panels";
import { Sidebar } from "../components/sidebar/sidebar";
import { ResizableHandle } from "../components/sidebar/resizable-handle";

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

  const handleLayoutChange = (layout: Layout) => {
    localStorage.setItem("sidebar-layout-v5", JSON.stringify(layout));
  };

  const defaultLayout = localStorage.getItem("sidebar-layout-v5")
    ? JSON.parse(localStorage.getItem("sidebar-layout-v5")!)
    : { "sidebar": 25, "main-content": 75 };

  return (
    <div
      className="app-container"
      style={{ height: "100vh", display: "flex", flexDirection: "column" }}
    >
      <PanelGroup
        direction="horizontal"
        onLayoutChanged={handleLayoutChange}
        style={{ flex: 1 }}
      >
        <Panel 
          id="sidebar"
          defaultSize={defaultLayout["sidebar"]} 
          minSize={20} 
          maxSize={50}
        >
          <Sidebar />
        </Panel>
        <ResizableHandle />
        <Panel 
          id="main-content"
          defaultSize={defaultLayout["main-content"]} 
          minSize={30}
        >
          <div
            style={{ height: "100%", display: "flex", flexDirection: "column" }}
          >
            <main style={{ flex: 1, overflow: "auto" }}>
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
          </div>
        </Panel>
      </PanelGroup>
      <TanStackRouterDevtools />
    </div>
  );
}
