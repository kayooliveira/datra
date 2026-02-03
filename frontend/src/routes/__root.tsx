import { createRootRoute, Outlet } from "@tanstack/react-router";
import { useSettings } from "../contexts/settings-context";
import { useTranslation } from "react-i18next";
import { EventsOn } from "../../wailsjs/runtime/runtime";
import { useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Panel, Group, Separator } from "react-resizable-panels";
import { Sidebar } from "../components/sidebar/sidebar";
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
import { SystemStatus } from "../components/status-bar/system-status";
import { useSyncMainTabContext } from "../hooks/useSyncMainTabContext";

export const Route = createRootRoute({
  component: () => (
    <StatusBarProvider>
      <RootLayout />
    </StatusBarProvider>
  ),
});

function RootLayout() {
  const { platformModifier, settings } = useSettings();
  const theme = settings.theme;
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { addItem, removeItem } = useStatusBar();
  const { setIsCreatingConnection } = useSessionStore();
  
  // Sync main tab context with active session
  useSyncMainTabContext();

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

  useEffect(() => {
    const handleRefresh = () => window.location.reload();

    addItem({
      id: "system-status",
      section: "left",
      priority: 1000,
      content: <SystemStatus />,
    });

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
          <Tag size={10} />v{pkg.version}
        </span>
      ),
    });

    return () => {};
  }, [addItem, removeItem, t, platformModifier]);

  return (
    <div className={styles.container}>
      <Toaster theme={theme as "light" | "dark" | "system"} richColors />
      <Group orientation="horizontal" className={styles.panelGroup}>
        <Panel id="sidebar" defaultSize="20%" minSize="15%" maxSize="35%">
          <Sidebar />
        </Panel>
        <Separator className={styles.resizeHandleHorizontal} />
        <Panel id="main-content" defaultSize="80%" minSize="50%">
          <div className={styles.mainWrapper}>
            <main className={styles.main}>
              <Outlet />
            </main>
          </div>
        </Panel>
      </Group>
      <StatusBar />
    </div>
  );
}
