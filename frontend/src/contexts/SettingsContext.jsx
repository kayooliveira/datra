import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { GetSettings, SaveSettings, UpdateMenu, GetPlatform } from '../../wailsjs/go/main/App';
import { useTranslation } from 'react-i18next';

const SettingsContext = createContext();

export const SettingsProvider = ({ children }) => {
  const [settings, setSettings] = useState({ language: 'en', theme: 'light' });
  const [loading, setLoading] = useState(true);
  const [platform, setPlatform] = useState('windows');
  const { i18n } = useTranslation();

  useEffect(() => {
    const init = async () => {
      const savedSettings = await GetSettings();
      const currentPlatform = await GetPlatform();
      
      const initialSettings = savedSettings || { language: 'en', theme: 'light' };
      setSettings(initialSettings);
      setPlatform(currentPlatform || 'windows');
      setLoading(false);
      
      if (initialSettings.language) {
        i18n.changeLanguage(initialSettings.language);
        UpdateMenu(initialSettings.language);
      }
    };
    
    init();
  }, [i18n]);

  useEffect(() => {
    document.body.setAttribute('data-theme', settings.theme);
  }, [settings.theme]);

  const updateSettings = useCallback(async (newSettings) => {
    const updated = { ...settings, ...newSettings };
    setSettings(updated);
    await SaveSettings(updated);
    
    if (newSettings.language) {
      i18n.changeLanguage(newSettings.language);
      UpdateMenu(newSettings.language);
    }
  }, [settings, i18n]);

  const platformModifier = useMemo(() => {
    if (platform === 'darwin') return '⌘';
    return 'Ctrl';
  }, [platform]);

  const value = useMemo(() => ({
    settings,
    updateSettings,
    platformModifier,
    loading
  }), [settings, updateSettings, platformModifier, loading]);

  if (loading) {
    return <div className="loading">Loading settings...</div>;
  }

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};
