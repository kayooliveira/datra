# Research: Connection Management Implementation

## Decision: Secure Storage for Credentials
**Choice**: `github.com/zalando/go-keyring`
**Rationale**: 
- Cross-platform support (macOS Keychain, Windows Credential Manager, Linux Secret Service).
- Simple API: `Set`, `Get`, `Delete`.
- Minimal dependencies.
- Handles the requirement of "No plain-text storage of secrets".
**Alternatives Considered**:
- `keybase/go-keychain`: Too macOS-focused.
- `99designs/keyring`: Good, but `zalando` is more lightweight for simple key-value storage.

## Decision: SSH Tunneling Implementation
**Choice**: `golang.org/x/crypto/ssh`
**Rationale**: 
- Official sub-repository for Go.
- Robust and widely used.
- Supports both password and private key (with/without passphrase) authentication.
- Can create a local listener that tunnels to the remote database port.
**Alternatives Considered**:
- External CLI `ssh`: Not portable, harder to manage process lifecycle.

## Decision: Keyboard Shortcuts Handling
**Choice**: `react-hotkeys-hook` (Frontend)
**Rationale**: 
- Declarative API in React.
- Handles focus management well.
- Supports complex key combinations.
- Lightweight.
- Actions like `Cmd+N` (New Connection) will be handled globally at the root layout level.
**Alternatives Considered**:
- Native `window.addEventListener('keydown')`: More boilerplate, harder to manage cleanup.

## Decision: Connection Metadata Storage
**Choice**: YAML (`gopkg.in/yaml.v3`)
**Rationale**: 
- Existing project uses YAML for settings.
- Human-readable and easy to debug.
- Stored in `~/.datra/connections.yaml`.
- Passwords will NOT be stored in this file; only a reference or the connection ID will be used to fetch the password from the Keyring.
**Alternatives Considered**:
- SQLite: Overkill for just a list of connections.
- JSON: Possible, but YAML matches the existing pattern.
