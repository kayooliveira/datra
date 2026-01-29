# API Contracts: Connection Management

These methods are exposed by the Go backend via Wails bindings to be called from the React frontend.

## GetConnections
Retrieves the list of all saved connections (without passwords).

- **Method**: `App.GetConnections()`
- **Returns**: `[]models.Connection`

---

## CreateConnection
Saves a new connection metadata to YAML and password to Keyring.

- **Method**: `App.CreateConnection(conn models.Connection, password string, tunnelPassword string)`
- **Arguments**:
    - `conn`: Metadata object.
    - `password`: Database password (not part of the struct in YAML).
    - `tunnelPassword`: SSH password/passphrase (optional).
- **Returns**: `string` (ID), `error`

---

## UpdateConnection
Updates an existing connection.

- **Method**: `App.UpdateConnection(conn models.Connection, password string, tunnelPassword string)`
- **Arguments**:
    - `conn`: Updated metadata.
    - `password`: New password (if provided, empty string means keep existing).
    - `tunnelPassword`: New tunnel password/passphrase.
- **Returns**: `error`

---

## DeleteConnection
Removes the connection and its secrets.

- **Method**: `App.DeleteConnection(id string)`
- **Returns**: `error`

---

## TestConnection
Attempts to connect to the database with the provided settings.

- **Method**: `App.TestConnection(conn models.Connection, password string, tunnelPassword string)`
- **Returns**: `error` (null/nil if successful)
- **Note**: Should be called asynchronously from the frontend to avoid blocking the UI.
