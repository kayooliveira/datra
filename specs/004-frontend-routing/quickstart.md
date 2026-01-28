# Quickstart: Adding a New Screen (TanStack Router)

This guide explains how to add a new screen (route) to the Datra application using TanStack Router.

## 1. Create the Route File

Create a new file in `src/routes/` (or define it in your route tree).

```tsx
// src/routes/new-feature.tsx
import { createRoute } from '@tanstack/react-router';
import { rootRoute } from './root';
import { NewFeatureComponent } from '../pages/NewFeature';

export const newFeatureRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: 'new-feature',
  component: NewFeatureComponent,
});
```

## 2. Register in the Route Tree

Add the new route to your main `routeTree` definition.

```tsx
const routeTree = rootRoute.addChildren([
  indexRoute,
  settingsRoute,
  newFeatureRoute, // Add here
]);
```

## 3. Add Navigation Link

Use the type-safe `Link` component.

```tsx
import { Link } from '@tanstack/react-router';

// ...
<Link to="/new-feature">New Feature</Link>
```

## 4. Verify

1. Run the app: `wails dev`
2. Navigate to `/#/new-feature` or click the link.
3. Observe that TypeScript validates the `to` prop.