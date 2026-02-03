# Research: Connection Profiles & Sessions

**Feature**: Connection Profiles & Sessions
**Date**: 2026-01-29

## Key Decisions

### 1. Password Encryption at Rest
**Decision**: Use `zalando/go-keyring` for secure storage of connection passwords, falling back to an encrypted local file if the keyring is unavailable (or for portability if explicitly requested later, but keyring is primary).
**Rationale**:
- **Security**: Leveraging OS-level secure storage (Keychain on macOS, Credential Manager on Windows, Secret Service/Keyring on Linux) is the gold standard for desktop apps.
- **Compliance**: Avoids managing encryption keys directly within the application code or config files.
- **Precedent**: This was proposed in previous exploration (006-manage-connections).

**Alternatives Considered**:
- **AES-GCM with local key**: Requires managing a master key (where to store it? how to protect it?). Less secure than OS keyring.
- **Obfuscation (Base64/XOR)**: Not secure. Rejected immediately per "Security First" principle.

### 2. Connection Pooling & Session Management
**Decision**: Use Go's standard `database/sql` interface which has built-in connection pooling.
- A global `SessionManager` struct will map `SessionID` (UUID) -> `*sql.DB`.
- Each `*sql.DB` instance represents a "Session".
- Drivers:
    - `github.com/go-sql-driver/mysql` (MySQL)
    - `github.com/jackc/pgx/v5/stdlib` (PostgreSQL) - better performance/features than lib/pq
    - `github.com/mattn/go-sqlite3` or `modernc.org/sqlite` (SQLite) - `modernc` is pure Go (no CGO), often preferred for cross-compilation ease in Wails, but `mattn` is standard. *Decision: `mattn/go-sqlite3` with CGO enabled is standard for Wails desktop apps unless cross-compilation from a single OS is a strict requirement. We will stick to standard drivers for now.*
    **Update**: Checking `go.mod` (not visible yet but assuming standard). We will verify driver availability.

**Rationale**: `database/sql` is robust, thread-safe, and handles pooling automatically.

### 3. Metadata Loading (Lazy)
**Decision**: Implement a uniform `MetadataProvider` interface in Go with implementations for each dialect (MySQL, PG, SQLite).
- Methods: `GetSchemas()`, `GetTables(schema)`, `GetColumns(schema, table)`.
- **Concurrency**: Metadata fetching runs in a goroutine. Wails events or promises return the data.
- **Caching**: The Frontend (React/TanStack Query) will handle caching of metadata to avoid re-fetching on every UI render. The Backend will just execute the query when asked. *Correction*: Spec says "Provide lazy-loaded metadata... with caching". It's often better to cache structured metadata in the backend `Session` struct to prevent repeated DB hits if the frontend component unmounts/remounts. *Refined Decision*: Backend implements basic caching for metadata, or simply relies on the frontend's query cache (React Query is excellent for this). Given "State Management: N/A (Frontend state only)" in `GEMINI.md` for previous features, we will lean on **Frontend Caching (TanStack Query)** for metadata to keep backend stateless-ish regarding UI view state.

## Unknowns Resolved
- **Encryption**: `zalando/go-keyring`.
- **Drivers**: Standard Go drivers.
- **Metadata**: Dialect-specific SQL queries (e.g., `information_schema` for MySQL/PG, `sqlite_master` for SQLite).

## Open Questions (None)
All technical approaches are standard for Go/Wails applications.
