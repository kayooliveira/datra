# Data Model: Empty State Guide

## Entities

### ConnectionProfile

Represents a saved database connection configuration.

| Field | Type | Description |
|-------|------|-------------|
| `id` | UUID | Unique identifier for the profile |
| `name` | string | User-friendly display name (e.g., "Prod DB") |
| `type` | string | Database type (`mysql`, `postgres`, `sqlite`, etc.) |
| `host` | string | Hostname or IP address |
| `port` | int | Port number |
| `username` | string | Database username |
| `database` | string | Target database name |
| `created_at` | timestamp | Record creation time |

**Note**: Secrets (passwords, keys) are NOT stored in this entity directly in plain text for API responses, complying with "Security First". They may be referenced or stored in a separate secure vault struct.

## Storage

- File: `~/.datra/connections.yaml` (YAML format)
- Collection: List of ConnectionProfile objects.
