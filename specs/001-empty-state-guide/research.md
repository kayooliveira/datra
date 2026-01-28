# Research: Empty State Guide

**Feature**: Empty State Guide
**Status**: Complete

## 1. Storage Strategy

**Decision**: Store connection profiles in `~/.datra/connections.yaml` (or OS equivalent user config dir).
**Rationale**: 
- `example.datra` suggests a YAML structure.
- User-specific configuration should be in the user's home directory to persist across updates.
- Wails provides access to user home directory.

**Alternatives Considered**:
- Local `connections.json` in app dir: Bad for updates/permissions.
- SQLite DB: Overkill for just connection config, though good for the app itself later. YAML/JSON is easier for users to edit manually if needed (Developer Productivity).

## 2. Data Structure

Based on `example.datra`, the `ConnectionProfile` needs:

```go
type ConnectionProfile struct {
    ID           string `json:"id"` // specific ID for management
    Name         string `json:"name"` // Display name
    DatabaseType string `json:"database_type"` // mysql, postgres, etc.
    Host         string `json:"host"`
    Port         int    `json:"port"`
    Username     string `json:"username"`
    // Password should be stored securely - referencing Constitution "Security First".
    // For now, we will just store the structure. Password handling might need a separate secure store (keychain) or encrypted file.
    // Spec doesn't strictly require secure storage impl details yet, but we must note it.
    DatabaseName string `json:"database_name"`
}
```

**Refinement**: `example.datra` shows `password` in plain text. **Constitution Violation**: "No plain-text storage of secrets is permitted."
**Resolution**: We will *design* the profile to support secure storage references, or at least encrypt the file. For this "Empty State" feature, we only need to know *if* connections exist. Loading them is a future step, but the structure must be defined.

## 3. Backend Integration (Wails)

**Decision**: Expose `HasConnections() bool` or `GetConnections() []ConnectionProfile`.
**Rationale**: Frontend needs to know if list is empty. `GetConnections` is more useful for the next feature (list connections), so we might as well implement the struct and return an empty list for now if the file doesn't exist.

## 4. Frontend State

**Decision**: React state `connections: ConnectionProfile[]`.
**Logic**: 
- On mount, call `GetConnections()`.
- If `connections.length === 0`, render `<EmptyState />`.
- Else, render placeholder `<ConnectionList />` (out of scope, but proves the switch).

## 5. UI Components

**Decision**: Refactor `App.jsx` hardcoded HTML into `components/EmptyState.jsx`.
**Rationale**: Clean code, separation of concerns.
