# Data Model: i18n and Settings Page

## Entities

### UserPreferences

Persistent configuration for the user.

| Field | Type | Description |
|-------|------|-------------|
| `language` | string | ISO code (`en`, `pt`) |
| `theme` | string | Theme name (`light`, `dark`) |

## Storage

- File: `~/.datra/settings.yaml`
- Format: YAML

### Example Structure
```yaml
language: pt
theme: dark
```
