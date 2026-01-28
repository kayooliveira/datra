# Research: Frontend Routing Strategy

## Decision
**Selected Library**: `@tanstack/react-router`

## Rationale
After re-evaluating the codebase and acknowledging that the project is strictly TypeScript (`.tsx`), **TanStack Router** is the optimal choice for several key reasons:

1.  **Full Type Safety**:
    - TanStack Router provides end-to-end type safety for routes, parameters, and search queries. This aligns perfectly with the project's use of TypeScript and prevents runtime errors during navigation.
    - Path params and search params are validated at compile time.

2.  **Built-in Search Parameter State Management**:
    - This is a critical feature for an IDE-style application. It allows us to manage complex UI states (like which tab is open, sidebar toggle, or filter settings) directly in the URL in a type-safe manner.

3.  **Modern Data Loading**:
    - It handles data fetching and caching natively with Loaders, reducing the need for manual `useEffect` logic for fetching initial view data.

4.  **Wails Compatibility**:
    - It supports hash-based history via `createHashHistory`, which is essential for Wails asset serving.

## Alternatives Considered

### React Router DOM
- **Pros**: Familiar, standard.
- **Cons**: Weaker type safety compared to TanStack Router. Requires external libraries or significant boilerplate for type-safe search params.

## Implementation Strategy
We will use `@tanstack/react-router` with a file-based routing approach if feasible, or a code-based route tree defined in `src/routes`. Given the project structure, we will start with a code-based approach for maximum control during the initial migration.