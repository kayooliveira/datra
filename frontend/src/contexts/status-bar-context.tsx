import React, { createContext, useContext, useState, ReactNode, useCallback } from "react";

export type StatusBarSection = "left" | "center" | "right";

export interface StatusBarItem {
  id: string;
  content: ReactNode;
  section: StatusBarSection;
  priority?: number; // Higher priority items appear first (left-to-right or right-to-left)
}

interface StatusBarContextType {
  items: StatusBarItem[];
  addItem: (item: StatusBarItem) => void;
  removeItem: (id: string) => void;
  updateItem: (id: string, content: ReactNode) => void;
}

const StatusBarContext = createContext<StatusBarContextType | undefined>(undefined);

export function StatusBarProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<StatusBarItem[]>([]);

  const addItem = useCallback((item: StatusBarItem) => {
    setItems((prev) => {
      if (prev.find((i) => i.id === item.id)) return prev;
      return [...prev, item];
    });
  }, []);

  const removeItem = useCallback((id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  }, []);

  const updateItem = useCallback((id: string, content: ReactNode) => {
      setItems((prev) => prev.map(i => i.id === id ? { ...i, content } : i));
  }, []);

  return (
    <StatusBarContext.Provider value={{ items, addItem, removeItem, updateItem }}>
      {children}
    </StatusBarContext.Provider>
  );
}

export function useStatusBar() {
  const context = useContext(StatusBarContext);
  if (context === undefined) {
    throw new Error("useStatusBar must be used within a StatusBarProvider");
  }
  return context;
}
