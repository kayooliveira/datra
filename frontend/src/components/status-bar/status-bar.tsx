import { useStatusBar } from "../../contexts/status-bar-context";
import styles from "./status-bar.module.css";

export function StatusBar() {
  const { items } = useStatusBar();

  const renderSection = (section: "left" | "center" | "right") => {
    const sectionItems = items
      .filter((item) => item.section === section)
      .sort((a, b) => (b.priority || 0) - (a.priority || 0));

    return (
      <div
        className={`${styles.section} ${section === "right" ? styles.sectionRight : ""}`}
      >
        {sectionItems.map((item) => (
          <div key={item.id} className={styles.item} title={item.id}>
            {item.content}
          </div>
        ))}
      </div>
    );
  };

  return (
    <footer className={styles.statusBar}>
      {renderSection("left")}
      {renderSection("center")}
      {renderSection("right")}
    </footer>
  );
}
