# Interface Contract: Query Execution & Metadata

**Feature**: 008-enhance-db-ui

## Wails Methods (Go -> JS)

### `ExecuteQuery` (Modified Behavior)

While the signature remains the same, the *frontend* is responsible for strictly enforcing the limit before calling this, or the backend logic must parse it. For this feature, we are implementing the logic primarily on the frontend (appending limits) or wrapping the call.

**Input**:
```typescript
sessionId: string
query: string // Now explicitly includes "LIMIT N" if selected in UI
```

**Output**:
```typescript
struct QueryResult {
    columns: string[]
    rows: any[][]   // Value-array format for density
    error?: string
    time_ms: number
}
```

## Component Contracts (React)

### Sidebar -> Context flow

1. **User clicks table** `users` in schema `public`.
2. `useSelectionStore` updates `selectedId` to `"conn1|public|users"`.
3. `useSessionStore` updates `activeContext` to `{ schema: "public" }`.
4. **Active Tab** subscribes to `activeContext` and updates its footer/statusbar to show "Context: public".

### Editor -> Execution flow

1. **User clicks Run**.
2. Component checks `ResultLimit` selector (e.g., 50).
3. Component checks if `LIMIT` exists in query regex.
4. If not, append `LIMIT 50`.
5. Call `ExecuteQuery(sessionId, modifiedQuery)`.
6. Result passed to `useTabStore` to update current tab's result state.
