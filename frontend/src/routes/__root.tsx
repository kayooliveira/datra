import { createRootRoute, Outlet } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/router-devtools";
import { useSettings } from "../contexts/settings-context";
import { useTranslation } from "react-i18next";
import { EventsOn } from "../../wailsjs/runtime/runtime";
import { useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Panel, Group as PanelGroup } from "react-resizable-panels";
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

  const onLayout = (sizes: number[]) => {
    localStorage.setItem("sidebar-layout-v3", JSON.stringify(sizes));
  };

  const defaultLayout = localStorage.getItem("sidebar-layout-v3")
    ? JSON.parse(localStorage.getItem("sidebar-layout-v3")!)
    : [20, 80];

  return (
    <div className="app-container" style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <PanelGroup direction="horizontal" onLayout={onLayout} style={{ flex: 1 }}>
        <Panel defaultSize={defaultLayout[0]} minSize={15} maxSize={50}>
          <Sidebar />
        </Panel>
        <ResizableHandle />
        <Panel defaultSize={defaultLayout[1]}>
          <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <main style={{ flex: 1, overflow: 'auto' }}>
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
