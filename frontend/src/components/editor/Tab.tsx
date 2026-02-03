import React, { useState, useRef, useEffect } from "react";
import { X, Database, Home } from "lucide-react";
import { QueryTab, MAIN_TAB_ID } from "../../stores/tabStore";
import styles from "./tab.module.css";
import { useTabStore } from "../../stores/tabStore";

interface TabProps {
  tab: QueryTab;
  isActive: boolean;
  onSelect: () => void;
  onClose: (e: React.MouseEvent) => void;
  isMainTab?: boolean;
}

export const Tab: React.FC<TabProps> = ({
  tab,
  isActive,
  onSelect,
  onClose,
  isMainTab = false,
}) => {
  const { renameTab } = useTabStore();
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(tab.title);
  const [menuPos, setMenuPos] = useState<{ x: number; y: number } | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Main tab cannot be renamed
  const canRename = !isMainTab;
  const canClose = !isMainTab;

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!isMainTab) {
      setMenuPos({ x: e.clientX, y: e.clientY });
    }
  };

  const handleDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (canRename) {
      setIsEditing(true);
      setMenuPos(null);
    }
  };

  const submitRename = () => {
    if (editValue.trim()) {
      renameTab(tab.id, editValue.trim());
    } else {
      setEditValue(tab.title); // Revert if empty
    }
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") submitRename();
    if (e.key === "Escape") {
      setEditValue(tab.title);
      setIsEditing(false);
    }
  };
  
  const handleAuxClick = (e: React.MouseEvent) => {
    if (e.button === 1 && canClose) { // Middle click (Mouse3)
      onClose(e);
    }
  };

  // Close menu on click outside
  useEffect(() => {
    const closeMenu = () => setMenuPos(null);
    if (menuPos) window.addEventListener("click", closeMenu);
    return () => window.removeEventListener("click", closeMenu);
  }, [menuPos]);

  const IconComponent = isMainTab ? Home : Database;

  // Build detailed tooltip
  const tooltipText = isMainTab
    ? tab.title
    : `${tab.title}${tab.connectionName ? ` - ${tab.connectionName}` : ""}`;

  return (
    <>
      <div
        className={`${styles.tab} ${isActive ? styles.active : ""} ${isMainTab ? styles.mainTab : ""}`}
        onClick={onSelect}
        onContextMenu={handleContextMenu}
        onDoubleClick={handleDoubleClick}
        onAuxClick={handleAuxClick}
        title={tooltipText}
      >
        <IconComponent size={12} className={styles.icon} />

        {isEditing ? (
          <input
            ref={inputRef}
            className={styles.titleInput}
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onBlur={submitRename}
            onKeyDown={handleKeyDown}
            onClick={(e) => e.stopPropagation()}
          />
        ) : (
          <div className={styles.titleContainer}>
            <span className={styles.title}>{tab.title}</span>
            {!isMainTab && tab.connectionName && (
              <span className={styles.connectionLabel}>
                {tab.connectionName}
              </span>
            )}
          </div>
        )}

        {canClose && (
          <button
            className={styles.closeBtn}
            onClick={onClose}
            title="Close tab"
          >
            <X size={12} />
          </button>
        )}
      </div>

      {menuPos && !isMainTab && (
        <div
          className={styles.contextMenu}
          style={{ top: menuPos.y, left: menuPos.x }}
          onClick={(e) => e.stopPropagation()}
        >
          <button
            className={styles.menuItem}
            onClick={() => {
              setIsEditing(true);
              setMenuPos(null);
            }}
          >
            Rename
          </button>
          <div className={styles.menuDivider} />
          <button className={styles.menuItem} onClick={onClose}>
            Close
          </button>
        </div>
      )}
    </>
  );
};
