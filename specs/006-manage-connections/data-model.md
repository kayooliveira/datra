# Data Model: Connection Management

## Connection Entity

The `Connection` entity represents a database source configuration.

| Field | Type | Description | Validation |
|-------|------|-------------|------------|
| `id` | UUID (string) | Unique identifier | Required, unique |
| `name` | string | Display name | Required, min 3 chars |
| `driver` | string | Database type (mysql, postgres, etc.) | Required, enum |
| `host` | string | Database host address | Required |
| `port` | int | Database port | Required, 1-65535 |
| `username` | string | Database user | Required |
| `database` | string | Default database name | Optional |
| `ssl_mode` | string | SSL/TLS configuration mode | Default: disable |
| `tunnel` | Object | SSH Tunnel configuration | Optional |
| `created_at` | DateTime | Timestamp of creation | Auto |
| `updated_at` | DateTime | Timestamp of last update | Auto |

### Tunnel Object

| Field | Type | Description |
|-------|------|-------------|
| `enabled` | boolean | Whether tunnel is active |
| `host` | string | SSH jump host |
| `port` | int | SSH port (default 22) |
| `username` | string | SSH user |
| `auth_method` | enum | `password` or `private_key` |
| `private_key_path` | string | Path to SSH private key |

## Storage Strategy

1. **Metadata**: Stored in `~/.datra/connections.yaml`.
    - Format: A list of `Connection` objects.
    - **Note**: The `password` field is EXCLUDED from YAML.
2. **Secrets**: Stored in OS Keyring.
    - Service: `datra`
    - Account: `connection:[id]` (e.g., `connection:550e8400-e29b-41d4-a716-446655440000`)
    - Value: The database password.
3. **SSH Secrets**: Stored in OS Keyring.
    - Account: `tunnel:[id]`
    - Value: The SSH password or private key passphrase.

## State Transitions

- **Idle**: Connection metadata saved.
- **Testing**: Temporary connection attempt (async).
- **Active**: Connection details validated and saved.
- **Deleted**: Metadata removed from YAML, secrets purged from Keyring.
