# Data Model: Connection Empty State

**Feature**: `001-connection-empty-state`  
**Date**: 2026-01-26

## Entities

### Connection

Represents a saved database connection definition.

**Fields (metadata only in this feature)**
- `id` (string): stable identifier (UUID recommended)
- `name` (string): human-readable label shown in the navigation tree
- `dbType` (string): database type identifier (e.g., `postgres`, `mysql`, `sqlite`, `mssql`)
- `host` (string, optional): hostname or address
- `port` (integer, optional): port number
- `database` (string, optional): database/schema name
- `username` (string, optional): username (non-secret)
- `createdAt` (string): ISO timestamp
- `updatedAt` (string): ISO timestamp

**Validation rules**
- `name` is required, trimmed, and must be 1..80 characters
- `dbType` is required and must be one of the supported types
- `port` (if present) must be 1..65535

**Security note**
- Passwords/tokens/cert private keys are NOT persisted in this feature.

### ConnectionList

A collection of `Connection` entities.

**Derived behavior**
- Empty state is active when `ConnectionList.length == 0`.

## Persistence

**Storage format**: JSON file containing an array of `Connection` objects.

**Schema evolution**
- Add a top-level `schemaVersion` field to the persisted document when migrations become necessary.
- For this feature, schema evolution is limited to additive fields and safe defaults.
