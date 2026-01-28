---
description: "Task list for i18n and Settings Page implementation"
---

# Tasks: i18n and Settings Page

**Input**: Design documents from `/specs/002-i18n-settings-page/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/api.md

**Organization**: Tasks are grouped by user story to enable independent implementation and testing.

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Initialize directory structure and translation files.

- [x] T001 [P] Create directory structure for translations at `frontend/src/translations/`
- [x] T002 [P] Create initial translation file `frontend/src/translations/en.json`
- [x] T003 [P] Create initial translation file `frontend/src/translations/pt.json`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure for settings persistence and state management.

- [x] T004 Define `UserPreferences` struct in `app.go`
- [x] T005 Implement `GetSettings` method in `app.go` to read from `~/.datra/settings.yaml`
- [x] T006 Implement `SaveSettings` method in `app.go` to write to `~/.datra/settings.yaml`
- [x] T007 [P] Create `frontend/src/contexts/SettingsContext.jsx` for context-based state management
- [x] T008 [P] Implement `SettingsProvider` in `SettingsContext.jsx` with memoized state access

**Checkpoint**: Backend and frontend foundation ready for specific user stories.

---

## Phase 3: User Story 1 - Access Settings and Change Language (Priority: P1) 🎯 MVP

**Goal**: Implement i18n provider and language switching functionality.

**Independent Test**: Switch to Portuguese in Settings and verify all UI strings update to PT.

### Implementation for User Story 1

- [x] T009 [P] [US1] Wrap `App` with `SettingsProvider` in `frontend/src/main.jsx`
- [x] T010 [US1] Implement translation helper function in `SettingsContext.jsx`
- [x] T011 [P] [US1] Create `frontend/src/components/SettingsPage.jsx` with language selector
- [x] T012 [US1] Integrate `GetSettings` and `SaveSettings` bindings in `SettingsProvider`
- [x] T013 [US1] Replace hardcoded strings in `App.jsx` and `EmptyState.jsx` with translation keys
- [x] T014 [US1] Add Portuguese translations for all existing strings in `pt.json`

**Checkpoint**: Language switching is functional and persistent.

---

## Phase 4: User Story 2 - Toggle Theme (Priority: P1)

**Goal**: Implement high-performance theme switching using CSS variables.

**Independent Test**: Toggle Dark mode in Settings and verify immediate color update without reload.

### Implementation for User Story 2

- [x] T015 [P] [US2] Define theme CSS variables in `frontend/src/style.css` for Light and Dark modes
- [x] T016 [US2] Implement theme application logic in `SettingsContext.jsx` using `data-theme` attribute
- [x] T017 [US2] Add theme toggle switch to `SettingsPage.jsx`
- [x] T018 [US2] Ensure theme persistence via `SaveSettings` in `SettingsProvider`

**Checkpoint**: Theme switching is functional and persistent.

---

## Phase 5: User Story 3 - Access Settings via Native Menu (Priority: P2)

**Goal**: Implement native OS menu integration for accessing settings.

**Independent Test**: Click "Settings" in the native OS menu bar and verify it opens the Settings page.

### Implementation for User Story 3

- [x] T019 [US3] Define native application menu in `main.go` using Wails Menu API
- [x] T020 [US3] Implement "Settings" menu item to emit `open-settings` event in `main.go`
- [x] T021 [US3] Add event listener for `open-settings` in `App.jsx` to navigate to Settings view

**Checkpoint**: Settings are accessible via the native OS menu.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: UI refinement and validation.

- [x] T022 [P] Polish `SettingsPage.jsx` layout for "IDE-style" density
- [x] T023 [P] Add Lucide icons to Settings options
- [x] T024 Run verification steps from `specs/002-i18n-settings-page/quickstart.md`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately.
- **Foundational (Phase 2)**: Depends on Setup - BLOCKS all user stories.
- **User Stories (Phase 3+)**: All depend on Foundational phase.
  - US1 (Language) and US2 (Theme) can run in parallel.
  - US3 (Native Menu) depends on US1/US2 UI being ready.

### Parallel Opportunities

- T001-T003 can run in parallel.
- T004-T006 (Backend) can run in parallel with T007-T008 (Frontend foundation).
- US1 and US2 implementation can be mostly parallel once foundation is ready.

---

## Implementation Strategy

### MVP First (Language & Theme)

1. Complete Setup and Foundational phases.
2. Implement User Story 1 (Language) to establish i18n pattern.
3. Implement User Story 2 (Theme) using CSS variables.
4. **VALIDATE**: Ensure persistence of both settings.

### Native Integration

1. Implement User Story 3 (Native Menu) to polish the desktop experience.
2. Perform final UI polish for IDE-style density.

---

## Notes

- [P] tasks = different files or decoupled logic.
- [USx] labels map tasks to specific user stories.
- All file paths are relative to repository root.
- Verification follows `quickstart.md` scenarios.
