import { useState, useEffect } from "react";
import { CommandIcon } from "lucide-react";
import { GetConnections } from "../wailsjs/go/main/App";
import EmptyState from "./components/EmptyState";

function App() {
  const [connections, setConnections] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchConnections();
  }, []);

  const fetchConnections = async () => {
    try {
      const result = await GetConnections();
      setConnections(result || []);
    } catch (error) {
      console.error("Failed to fetch connections:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateConnection = () => {
    console.log("Create Connection Clicked");
    // TODO: Implement connection creation dialog
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="app-container">
      <header></header>
      <main>
        {connections.length === 0 ? (
          <EmptyState onCreateConnection={handleCreateConnection} />
        ) : (
          <div className="connection-list">
            <h1>Connections</h1>
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
            Refresh
          </button>
        </span>
        <span>
          <CommandIcon size={16} /> + N New Connection
        </span>
        <span>
          <CommandIcon size={16} /> + O Open File (.datra)
        </span>
      </footer>
    </div>
  );
}

export default App;
