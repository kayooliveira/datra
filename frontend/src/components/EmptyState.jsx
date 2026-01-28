import { DatabaseIcon, PlusIcon } from "lucide-react";

function EmptyState({ onCreateConnection }) {
  return (
    <div className="empty-state">
      <div className="empty-state-content">
        <DatabaseIcon size={120} strokeWidth={1} className="empty-state-icon" />
        <h1>No Database Connections</h1>
        <p>
          Connect to your first database to get started.
          Datra supports PostgreSQL, MySQL, SQLite, and more.
        </p>
        <button className="primary-button" onClick={onCreateConnection}>
          Create New Connection <PlusIcon size={16} />
        </button>
      </div>
    </div>
  );
}

export default EmptyState;
