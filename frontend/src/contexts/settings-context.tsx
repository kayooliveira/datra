import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import {
  GetSettings,
  SaveSettings,
  UpdateMenu,
  GetPlatform,
} from "../../wailsjs/go/main/App";
import { useTranslation } from "react-i18next";

interface Settings {
  language: string;
  theme: string;
}

interface SettingsContextType {
  settings: Settings;
  updateSettings: (newSettings: Partial<Settings>) => Promise<void>;
  platformModifier: string;
  loading: boolean;
}

const SettingsContext = createContext<SettingsContextType | undefined>(
  undefined,
);

interface SettingsProviderProps {
  children: React.ReactNode;
}

export const SettingsProvider: React.FC<SettingsProviderProps> = ({
  children,
}) => {
  const [settings, setSettings] = useState<Settings>({
    language: "en",
    theme: "light",
  });
  const [loading, setLoading] = useState(true);
  const [platform, setPlatform] = useState("windows");
  const { i18n, t } = useTranslation();

  useEffect(() => {
    const init = async () => {
      const savedSettings = await GetSettings();
      const currentPlatform = await GetPlatform();

      const initialSettings = savedSettings || {
        language: "en",
        theme: "light",
      };
      setSettings(initialSettings);
      setPlatform(currentPlatform || "windows");
      setLoading(false);

      if (initialSettings.language) {
        i18n.changeLanguage(initialSettings.language);
        UpdateMenu(initialSettings.language);
      }
    };

    init();
  }, [i18n]);

  useEffect(() => {
    document.body.setAttribute("data-theme", settings.theme);
  }, [settings.theme]);

  const updateSettings = useCallback(
    async (newSettings: Partial<Settings>) => {
      const updated = { ...settings, ...newSettings };
      setSettings(updated);
      await SaveSettings(updated);

      if (newSettings.language) {
        i18n.changeLanguage(newSettings.language);
        UpdateMenu(newSettings.language);
      }
    },
    [settings, i18n],
  );

  const platformModifier = useMemo(() => {
    if (platform === "darwin") return "⌘";
    return "Ctrl";
  }, [platform]);

  const value = useMemo(
    () => ({
      settings,
      updateSettings,
      platformModifier,
      loading,
    }),
    [settings, updateSettings, platformModifier, loading],
  );

  if (loading) {
    return <div className="loading">{t("app.loading")}</div>;
  }

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = (): SettingsContextType => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error("useSettings must be used within a SettingsProvider");
  }
  return context;
};
