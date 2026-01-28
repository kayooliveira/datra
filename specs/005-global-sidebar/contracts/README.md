# API Contracts

This feature (Global Sidebar) primarily consumes existing backend functionality.

## Existing Contracts Used

- `GetConnections`: Retrieves the list of connection profiles.
- `SaveConnection` (Future/Out of Scope): Referenced by the "New Connection" button, but the implementation of the *creation dialog* itself is likely a separate or subsequent step, though the entry point is added here.

## New Contracts

None. The sidebar is a UI-only reorganization of existing data.
