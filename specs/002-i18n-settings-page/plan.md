# Implementation Plan: i18n and Settings Page

**Branch**: `002-i18n-settings-page` | **Date**: 2026-01-27 | **Spec**: [specs/002-i18n-settings-page/spec.md](../spec.md)
**Input**: Feature specification from `specs/002-i18n-settings-page/spec.md`

## Summary

Implement a native-style settings experience with i18n support (EN/PT) and theme switching (Light/Dark). The solution uses Wails native menus for triggers and CSS variables for high-performance theme transitions.

## Technical Context

**Language/Version**: Go 1.23, React 18.2.0
**Primary Dependencies**: Wails v2.11.0, `gopkg.in/yaml.v3`, Lucide React
**Storage**: `~/.datra/settings.yaml`
**Testing**: Go unit tests for settings logic, manual UI verification
**Target Platform**: Windows, macOS, Linux (Desktop)
**Project Type**: Single project
**Performance Goals**: <100ms UI update on setting change, 0 unnecessary re-renders.
**Constraints**: Native menu integration required.

## Constitution Check

- **Security First**: ✅ Settings do not contain sensitive data.
- **High Performance**: ✅ CSS variables for themes; context-based i18n with memoization.
- **Developer Productivity**: ✅ YAML config; clear API contract.
- **IDE-Style UX**: ✅ Native OS menus; dense settings layout.

## Project Structure

### Documentation (this feature)

```text
specs/002-i18n-settings-page/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
└── contracts/
    └── api.md
```

### Source Code

```text
backend/ (root)
├── app.go             # GetSettings, SaveSettings
└── main.go            # Native menu definition

frontend/src/
├── contexts/
│   └── SettingsContext.jsx # i18n & Theme Provider
├── components/
│   └── SettingsPage.jsx    # UI
└── translations/
    ├── en.json
    └── pt.json
```

**Structure Decision**: Context-based state management for settings to provide high-performance access to language and theme across the app.

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| None | N/A | N/A |