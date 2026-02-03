# Feature Specification: Fix Connection Context Switching

**Feature Branch**: `009-connection-context`  
**Created**: February 2, 2026  
**Status**: Draft  
**Input**: User description: "Estou com um problema com a parte de identificacao e exibicao das informacoes baseado no contexto da session selecionada na sidebar, quando eu tenho mais de uma conexao ativa, ao clicar nela na sidebar, ele da um leve loading mas nao mostra a informacao da connection selecionada, sempre mostra da primeira conection feita, ao abrir queries sempre na primeira selecionada, nao ta dando pra \"acessar\" varias conexoes ao mesmo tempo, o ideal é que ao clicar numa conection ou em uma tabela de uma coenction na sidebar, o overview mude pra conection selecionada, e ao abrir novas queries com command t ou command n ou no botao, deve abrir uma tab relacionada a conection selecionada etc."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Switch Connection Context via Sidebar (Priority: P1)

As a database administrator working with multiple database connections, when I click on a different connection in the sidebar, the application should immediately display the overview and details for the selected connection, allowing me to work with multiple databases simultaneously.

**Why this priority**: This is the core functionality that's currently broken. Users cannot effectively work with multiple database connections, which defeats the purpose of multi-connection support. Without this, users are limited to a single connection workflow.

**Independent Test**: Can be fully tested by creating two active database connections, clicking on each connection in the sidebar, and verifying that the main view updates to show the correct connection's information (tables, schema, metadata). This delivers immediate value by restoring multi-connection capability.

**Acceptance Scenarios**:

1. **Given** I have two active database connections (Connection A and Connection B), **When** I click on Connection B in the sidebar after being on Connection A, **Then** the overview panel updates to show Connection B's database information, tables, and metadata
2. **Given** I am viewing Connection A's overview, **When** I click on Connection B in the sidebar, **Then** a loading indicator appears briefly and then displays Connection B's content (not Connection A's)
3. **Given** I have three active connections, **When** I click on any connection in the sidebar, **Then** the application displays the correct connection's information every time, not always the first connection

---

### User Story 2 - Switch Context by Selecting Table in Sidebar (Priority: P1)

As a database user navigating through different databases, when I click on a table belonging to a specific connection in the sidebar, the application should switch context to that connection and display the table's information, enabling seamless navigation across multiple databases.

**Why this priority**: This is equally critical as Story 1 because users naturally navigate by selecting tables, not just connections. This provides an intuitive navigation pattern that users expect.

**Independent Test**: Can be fully tested by creating two connections with different tables, clicking on a table from Connection B while viewing Connection A, and verifying that the context switches to Connection B and displays the selected table's information.

**Acceptance Scenarios**:

1. **Given** I am viewing Connection A, **When** I click on a table from Connection B in the sidebar, **Then** the application switches context to Connection B and displays the selected table's schema and data
2. **Given** I have multiple connections with tables expanded in the sidebar, **When** I click on any table, **Then** the application correctly identifies which connection owns that table and switches to that connection's context
3. **Given** I am viewing a table from Connection A, **When** I click on a different table from the same Connection A, **Then** the view updates to the new table without changing the connection context

---

### User Story 3 - Open New Query Tabs in Active Connection Context (Priority: P2)

As a database user working with multiple connections, when I open a new query tab using keyboard shortcuts (Command+T, Command+N) or the new query button, the query tab should be associated with the currently selected connection, allowing me to execute queries against the correct database.

**Why this priority**: This is essential for productivity but depends on Stories 1 and 2 working correctly first. Users need to be able to create queries in the context of their selected connection, but they must first be able to reliably switch contexts.

**Independent Test**: Can be fully tested by selecting a connection in the sidebar, opening a new query tab via Command+T or the button, and verifying that the query tab is bound to the selected connection (not the first connection created).

**Acceptance Scenarios**:

1. **Given** I have selected Connection B in the sidebar, **When** I press Command+T to open a new query tab, **Then** the new query tab is associated with Connection B and queries execute against Connection B's database
2. **Given** I have selected Connection A in the sidebar, **When** I click the "New Query" button, **Then** the new query tab opens with Connection A as its context
3. **Given** I have multiple query tabs open for different connections, **When** I execute a query, **Then** it runs against the correct connection associated with that tab
4. **Given** I am viewing a table from Connection C, **When** I press Command+N to create a new query, **Then** the query tab opens with Connection C as its context

---

### Edge Cases

- What happens when a connection is disconnected while being viewed, and the user tries to switch to it from the sidebar?
- How does the system handle switching to a connection that is in a loading or error state?
- What happens if a user deletes the currently active connection - which connection becomes active?
- How does the system maintain context when multiple browser tabs/windows have the application open with different active connections?
- What happens when the user switches connections very rapidly (click multiple connections in quick succession)?
- How should the system behave if a table is deleted from the database while being viewed in the context?

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST maintain an "active connection context" state that tracks which database connection is currently selected by the user
- **FR-002**: System MUST update the active connection context immediately when a user clicks on a different connection in the sidebar
- **FR-003**: System MUST update the active connection context when a user clicks on a table in the sidebar, switching to the connection that owns that table
- **FR-004**: System MUST update all relevant UI components (overview panel, metadata displays, query editor context) when the active connection context changes
- **FR-005**: System MUST display a loading indicator during connection context switches that completes when the new connection's data is ready to display
- **FR-006**: System MUST associate new query tabs with the currently active connection context when created via keyboard shortcuts (Command+T, Command+N) or UI buttons
- **FR-007**: System MUST maintain separate query tab contexts for different connections, ensuring queries execute against the correct database
- **FR-008**: System MUST prevent the "always show first connection" bug by properly binding UI components to the active connection context, not a static reference
- **FR-009**: System MUST persist the active connection context when users navigate between different views (overview, query editor, table browser)
- **FR-010**: System MUST handle connection disconnection gracefully, switching to another available connection or showing an appropriate empty state
- **FR-011**: System MUST visually indicate which connection is currently active in the sidebar (highlight, icon, or other visual cue)

### Key Entities

- **Active Connection Context**: Represents the currently selected database connection that all user actions are performed against; includes connection identifier, connection metadata, and associated UI state
- **Connection Session**: Represents an active database connection with its configuration, state (connected, disconnected, loading, error), and associated resources (query tabs, cached metadata)
- **Query Tab**: Represents an open query editor tab bound to a specific connection context; maintains its own query content, execution history, and results tied to its parent connection

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can switch between different active connections and see the correct connection's information displayed within 500ms of clicking
- **SC-002**: 100% of connection switches via sidebar clicks result in the correct connection's data being displayed (zero "wrong connection" displays)
- **SC-003**: Users can open new query tabs that execute against the correct selected connection 100% of the time
- **SC-004**: The application supports at least 5 simultaneous active connections with accurate context switching between all of them
- **SC-005**: Users can navigate between 10 different connections via sidebar clicks without experiencing any incorrect data displays or stale context issues
- **SC-006**: The active connection indicator in the sidebar accurately reflects the current context 100% of the time
