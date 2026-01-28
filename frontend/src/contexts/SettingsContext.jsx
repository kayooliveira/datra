import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { GetSettings, SaveSettings, UpdateMenu, GetPlatform } from '../../wailsjs/go/main/App';
import en from '../translations/en.json';
import pt from '../translations/pt.json';

const SettingsContext = createContext();

const translations = { en, pt };

export const SettingsProvider = ({ children }) => {
  const [settings, setSettings] = useState({ language: 'en', theme: 'light' });
  const [loading, setLoading] = useState(true);
  const [platform, setPlatform] = useState('windows');

  useEffect(() => {
    const init = async () => {
      const savedSettings = await GetSettings();
      const currentPlatform = await GetPlatform();
      
      setSettings(savedSettings || { language: 'en', theme: 'light' });
      setPlatform(currentPlatform || 'windows');
      setLoading(false);
      
      if (savedSettings?.language) {
        UpdateMenu(savedSettings.language);
      }
    };
    
    init();
  }, []);

  useEffect(() => {
    document.body.setAttribute('data-theme', settings.theme);
  }, [settings.theme]);

  const updateSettings = useCallback(async (newSettings) => {
    const updated = { ...settings, ...newSettings };
    setSettings(updated);
    await SaveSettings(updated);
    
    if (newSettings.language) {
      UpdateMenu(newSettings.language);
    }
  }, [settings]);

  const platformModifier = useMemo(() => {
    if (platform === 'darwin') return '⌘';
    return 'Ctrl';
  }, [platform]);

  const t = useCallback((key) => {
    const keys = key.split('.');
    let value = translations[settings.language];
    
    for (const k of keys) {
      if (value[k] === undefined) {
        return key;
      }
      value = value[k];
    }
    
    return value;
  }, [settings.language]);

  const value = useMemo(() => ({
    settings,
    updateSettings,
    t,
    platformModifier,
    loading
  }), [settings, updateSettings, t, platformModifier, loading]);

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
