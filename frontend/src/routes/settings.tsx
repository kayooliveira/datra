import { useSettings } from "../contexts/settings-context";
import { XIcon, MoonIcon, SunIcon, GlobeIcon } from "lucide-react";
import { useTranslation } from "react-i18next";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import styles from "./settings.module.css";

interface SettingsPageProps {
  onClose?: () => void;
}

export const Route = createFileRoute("/settings")({
  component: SettingsPage,
});

function SettingsPage({ onClose }: SettingsPageProps) {
  const { settings, updateSettings } = useSettings();
  const { t } = useTranslation();
  const navigate = useNavigate();

  const handleClose = () => {
    if (onClose) {
      onClose();
    } else {
      navigate({ to: "/" });
    }
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>{t("settings.title")}</h1>
        <button className={styles.closeBtn} onClick={handleClose} title="Close">
          <XIcon size={18} />
        </button>
      </header>

      <div className={styles.content}>
        <section className={styles.section}>
          <div className={styles.item}>
            <div className={styles.label}>
              <GlobeIcon size={18} />
              <span>{t("settings.language")}</span>
            </div>
            <select
              value={settings.language}
              onChange={(e) => updateSettings({ language: e.target.value })}
              className={styles.select}
            >
              <option value="en">{t("settings.languages.en")}</option>
              <option value="pt">{t("settings.languages.pt")}</option>
            </select>
          </div>

          <div className={styles.item}>
            <div className={styles.label}>
              {settings.theme === "dark" ? (
                <MoonIcon size={18} />
              ) : (
                <SunIcon size={18} />
              )}
              <span>{t("settings.theme")}</span>
            </div>
            <div className={styles.themeToggle}>
              <button
                className={`${styles.toggleOption} ${settings.theme === "light" ? styles.activeToggle : ""}`}
                onClick={() => updateSettings({ theme: "light" })}
              >
                {t("settings.themes.light")}
              </button>
              <button
                className={`${styles.toggleOption} ${settings.theme === "dark" ? styles.activeToggle : ""}`}
                onClick={() => updateSettings({ theme: "dark" })}
              >
                {t("settings.themes.dark")}
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}