import { create } from 'zustand';

interface SelectionState {
  selectedId: string | null; // e.g., "connId|dbName|tableName"
  selectedType: 'connection' | 'database' | 'schema' | 'table' | 'column' | null;
  
  // Actions
  selectItem: (id: string, type: SelectionState['selectedType']) => void;
  clearSelection: () => void;
}

export const useSelectionStore = create<SelectionState>((set) => ({
  selectedId: null,
  selectedType: null,

  selectItem: (id: string, type: SelectionState['selectedType']) => set({ selectedId: id, selectedType: type }),
  clearSelection: () => set({ selectedId: null, selectedType: null }),
}));
