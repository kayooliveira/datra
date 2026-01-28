import { Database } from "lucide-react";

interface Connection {
  id: string;
  name: string;
  [key: string]: any;
}

interface ConnectionListProps {
  connections: Connection[];
  onSelect: (id: string) => void;
}

export function ConnectionList({ connections, onSelect }: ConnectionListProps) {
  return (
    <ul className="connection-list">
      {connections.map((conn) => (
        <li key={conn.id}>
          <button
            onClick={() => onSelect(conn.id)}
            className="connection-item-btn"
            title={conn.name}
          >
            <Database size={16} style={{ opacity: 0.7 }} />
            <span className="connection-name">{conn.name}</span>
          </button>
        </li>
      ))}
    </ul>
  );
}