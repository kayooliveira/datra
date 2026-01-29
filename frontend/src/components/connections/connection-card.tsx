import { connection } from "../../../wailsjs/go/models";
import { Database, Server, Settings } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";
import styles from "./connection-card.module.css";

interface ConnectionCardProps {
  connection: connection.Connection;
  onSelect: (id: string) => void;
}

export function ConnectionCard({ connection, onSelect }: ConnectionCardProps) {
  const navigate = useNavigate();

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigate({ to: "/connections/$id", params: { id: connection.id } });
  };

  return (
    <div className={styles.card} onClick={() => onSelect(connection.id)}>
      <div className={styles.header}>
        <div className={styles.icon}>
           <Database size={20} />
        </div>
        <h3 className={styles.title}>{connection.name}</h3>
        <button className={styles.editBtn} onClick={handleEdit} aria-label="Edit">
          <Settings size={16} />
        </button>
      </div>
      <div className={styles.details}>
        <div className={styles.detailItem}>
          <Server size={12} />
          <span>{connection.host}:{connection.port}</span>
        </div>
        <div className={styles.detailItem}>
          <span className={styles.badge}>{connection.driver}</span>
        </div>
      </div>
    </div>
  );
}