import React from 'react';
import { useSettings } from '../contexts/SettingsContext';
import { XIcon, MoonIcon, SunIcon, GlobeIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';

function SettingsPage({ onClose }) {
  const { settings, updateSettings } = useSettings();
  const { t } = useTranslation();

  return (
    <div className="settings-page">
      <header className="settings-header">
        <h1>{t('settings.title')}</h1>
        <button className="icon-button" onClick={onClose} title="Close">
          <XIcon size={18} />
        </button>
      </header>

      <div className="settings-content">
        <section className="settings-section">
          <div className="setting-item">
            <div className="setting-label">
              <GlobeIcon size={16} />
              <span>{t('settings.language')}</span>
            </div>
            <select 
              value={settings.language} 
              onChange={(e) => updateSettings({ language: e.target.value })}
              className="settings-select"
            >
              <option value="en">{t('settings.languages.en')}</option>
              <option value="pt">{t('settings.languages.pt')}</option>
            </select>
          </div>

          <div className="setting-item">
            <div className="setting-label">
              {settings.theme === 'dark' ? <MoonIcon size={16} /> : <SunIcon size={16} />}
              <span>{t('settings.theme')}</span>
            </div>
            <div className="theme-toggle">
              <button 
                className={`toggle-option ${settings.theme === 'light' ? 'active' : ''}`}
                onClick={() => updateSettings({ theme: 'light' })}
              >
                {t('settings.themes.light')}
              </button>
              <button 
                className={`toggle-option ${settings.theme === 'dark' ? 'active' : ''}`}
                onClick={() => updateSettings({ theme: 'dark' })}
              >
                {t('settings.themes.dark')}
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

export default SettingsPage;
