import { useState, useEffect } from "react";
import { GetConnections } from "../wailsjs/go/main/App";
import { EventsOn } from "../wailsjs/runtime/runtime";
import EmptyState from "./components/EmptyState";
import SettingsPage from "./components/SettingsPage";
import { useSettings } from "./contexts/SettingsContext";
import { useTranslation } from "react-i18next";

interface Connection {
  id: string;
  name: string;
  [key: string]: any;
}

function App() {
  const [connections, setConnections] = useState<Connection[]>([]);
  const [loadingConnections, setLoadingConnections] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const { platformModifier } = useSettings();
  const { t } = useTranslation();

  useEffect(() => {
    fetchConnections();
    
    const unbind = EventsOn("open-settings", () => {
      setShowSettings(true);
    });
    
    return () => unbind();
  }, []);

  const fetchConnections = async () => {
    try {
      const result = await GetConnections();
      setConnections(result || []);
    } catch (error) {
      console.error("Failed to fetch connections:", error);
    } finally {
      setLoadingConnections(false);
    }
  };

  const handleCreateConnection = () => {
    console.log("Create Connection Clicked");
    // TODO: Implement connection creation dialog
  };

  if (loadingConnections) {
    return <div className="loading">{t('app.loading')}</div>;
  }

  return (
    <div className="app-container">
      <main>
        {showSettings ? (
          <SettingsPage onClose={() => setShowSettings(false)} />
        ) : connections.length === 0 ? (
          <EmptyState onCreateConnection={handleCreateConnection} />
        ) : (
          <div className="connection-list">
            <h1>{t('app.connections')}</h1>
            <ul>
              {connections.map((conn) => (
                <li key={conn.id}>{conn.name}</li>
              ))}
            </ul>
          </div>
        )}
      </main>
      <footer>
        <span>
          <button onClick={fetchConnections} style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', padding: 0, font: 'inherit' }}>
            {t('app.footer.refresh')}
          </button>
        </span>
        <span>
          {platformModifier} + N {t('app.footer.new_connection')}
        </span>
        <span>
          {platformModifier} + O {t('app.footer.open_file')}
        </span>
      </footer>
    </div>
  );
}

export default App;