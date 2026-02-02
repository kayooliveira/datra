# Data Model: Enhance Database UI/UX

**Feature**: 008-enhance-db-ui

## Frontend State Entities (Zustand Stores)

### 1. Tab Store (`useTabStore`)

Manages the state of the multi-tab SQL editor.

```typescript
interface QueryTab {
  id: string;             // UUID
  title: string;          // e.g., "Query 1", "users.sql"
  content: string;        // SQL text
  context: {
    connectionId: string;
    database?: string;
    schema?: string;
  };
  results?: QueryResult;  // Last execution result
  isExecuting: boolean;
  error?: string;
}

interface TabState {
  tabs: QueryTab[];
  activeTabId: string | null;
  
  // Actions
  addTab: () => void;
  closeTab: (id: string) => void;
  setActiveTab: (id: string) => void;
  updateTab: (id: string, updates: Partial<QueryTab>) => void;
  setTabContent: (id: string, content: string) => void;
  setTabResults: (id: string, results: QueryResult) => void;
}
```

### 2. Selection Store (`useSelectionStore`)

Manages the visual selection state of the sidebar and synchronizes context.

```typescript
interface SelectionState {
  selectedId: string | null; // e.g., "connId|dbName|tableName"
  selectedType: 'connection' | 'database' | 'schema' | 'table' | 'column';
  
  // Actions
  selectItem: (id: string, type: SelectionState['selectedType']) => void;
  clearSelection: () => void;
}
```

### 3. Session Store Extension (Existing `useSessionStore`)

Needs extension to track the active query context derived from selection.

```typescript
interface SessionState {
  // ... existing fields
  activeContext: {
    database?: string;
    schema?: string;
  } | null;
  
  // Actions
  setActiveContext: (context: { database?: string; schema?: string } | null) => void;
}
```

## Backend Entities (Go)

### Query Execution Options

Updated execution payload to support limits.

```go
type ExecuteQueryOptions struct {
    Limit int `json:"limit"` // 0 = unlimited, otherwise row count
}
```

*Note: This might be passed as an argument to `ExecuteQuery` or handled by appending to the string on the frontend.*

## UI Components Props

### ResultGrid Props

```typescript
interface ResultGridProps {
  data: Record<string, any>[]; // Array of row objects
  columns: string[];           // Column names
  isLoading: boolean;
  error?: string;
}
```
