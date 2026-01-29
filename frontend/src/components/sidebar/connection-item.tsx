import { connection } from "../../../wailsjs/go/models";
import { Database, Settings } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";
import styles from "./connection-item.module.css";

interface ConnectionItemProps {
  connection: connection.Connection;
  onSelect: (id: string) => void;
}

export function ConnectionItem({ connection, onSelect }: ConnectionItemProps) {
  const navigate = useNavigate();

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigate({ to: "/connections/$id", params: { id: connection.id } });
  };

  return (
    <div className={styles.container}>
      <button
        onClick={() => onSelect(connection.id)}
        className={styles.button}
        title={connection.name}
      >
        <Database size={14} className={styles.icon} />
        <span className={styles.name}>{connection.name}</span>
      </button>
      <button className={styles.editBtn} onClick={handleEdit} aria-label="Edit connection">
        <Settings size={12} />
      </button>
    </div>
  );
}