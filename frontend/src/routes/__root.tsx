import { createRootRoute, Outlet } from "@tanstack/react-router";
import { useSettings } from "../contexts/settings-context";
import { useTranslation } from "react-i18next";
import { EventsOn } from "../../wailsjs/runtime/runtime";
import { useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Layout, Panel, Group as PanelGroup } from "react-resizable-panels";
import { Sidebar } from "../components/sidebar/sidebar";
import { ResizableHandle } from "../components/sidebar/resizable-handle";
import { useHotkeys } from "react-hotkeys-hook";
import styles from "./root.module.css";
import { RefreshCw, FilePlus, FolderOpen, Tag } from "lucide-react";
import {
  StatusBarProvider,
  useStatusBar,
} from "../contexts/status-bar-context";
import { StatusBar } from "../components/status-bar/status-bar";
import pkg from "../../package.json";
import { useSessionStore } from "../stores/sessionStore";
import { Toaster } from "sonner";

export const Route = createRootRoute({
  component: () => (
    <StatusBarProvider>
      <RootLayout />
    </StatusBarProvider>
  ),
});

function RootLayout() {
  const { platformModifier, theme } = useSettings();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { addItem, removeItem } = useStatusBar();
  const { setIsCreatingConnection } = useSessionStore();

  const modifier = platformModifier === "Ctrl" ? "ctrl" : "meta";

  useHotkeys(
    `${modifier}+n`,
    (e) => {
      e.preventDefault();
      setIsCreatingConnection(true);
    },
    { enableOnFormTags: true },
  );

  useHotkeys(
    `${modifier}+h`,
    (e) => {
      e.preventDefault();
      navigate({ to: "/" });
    },
    { enableOnFormTags: true },
  );

  useEffect(() => {
    const unbind = EventsOn("open-settings", () => {
      navigate({ to: "/settings" });
    });

    return () => unbind();
  }, [navigate]);

  // Register Global Status Bar Items
  useEffect(() => {
    const handleRefresh = () => window.location.reload();

    addItem({
      id: "refresh-app",
      section: "left",
      priority: 100,
      content: (
        <button
          onClick={handleRefresh}
          className={styles.statusBarBtn}
          title="Reload App"
        >
          <RefreshCw size={10} />
          {t("app.footer.refresh")}
        </button>
      ),
    });

    addItem({
      id: "new-connection-hint",
      section: "right",
      priority: 10,
      content: (
        <span className={styles.statusBarText}>
          <FilePlus size={10} />
          {platformModifier} + N {t("app.footer.new_connection")}
        </span>
      ),
    });

    addItem({
      id: "open-file-hint",
      section: "right",
      priority: 5,
      content: (
        <span className={styles.statusBarText}>
          <FolderOpen size={10} />
          {platformModifier} + O {t("app.footer.open_file")}
        </span>
      ),
    });

    addItem({
      id: "app-version",
      section: "right",
      priority: 0,
      content: (
        <span className={styles.statusBarText} title={`Version ${pkg.version}`}>
          <Tag size={10} />
          v{pkg.version}
        </span>
      ),
    });

    // Cleanup not strictly necessary for root items but good practice if component unmounts
    return () => {
      // In a real app we might want to keep these persistent, but for now:
      // removeItem("refresh-app");
      // ...
    };
  }, [addItem, removeItem, t, platformModifier]);

  const handleLayoutChange = (layout: Layout) => {
    localStorage.setItem("sidebar-layout-v5", JSON.stringify(layout));
  };

  const defaultLayout = localStorage.getItem("sidebar-layout-v5")
    ? JSON.parse(localStorage.getItem("sidebar-layout-v5")!)
    : { sidebar: 20, "main-content": 80 };

  return (
    <div className={styles.container}>
      <Toaster theme={theme as any} richColors />
      <PanelGroup
        dir="horizontal"
        onLayoutChanged={handleLayoutChange}
        style={{ flex: 1 }}
      >
        <Panel
          id="sidebar"
          defaultSize={defaultLayout["sidebar"]}
          minSize="30%"
          maxSize="50%"
        >
          <Sidebar />
        </Panel>
        <ResizableHandle />
        <Panel
          id="main-content"
          defaultSize={defaultLayout["main-content"]}
          minSize="50%"
        >
          <div className={styles.mainWrapper}>
            <main className={styles.main}>
              <Outlet />
            </main>
          </div>
        </Panel>
      </PanelGroup>
      <StatusBar />
    </div>
  );
}
