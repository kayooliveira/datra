import React from "react";
import { createRoot } from "react-dom/client";
import { SettingsProvider } from "./contexts/settings-context";
import { createRouter, RouterProvider } from "@tanstack/react-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { routeTree } from "./routeTree.gen";

import "./style.css";
import "./i18n";

const container = document.getElementById("root")!;

const root = createRoot(container);

const router = createRouter({ routeTree });
const queryClient = new QueryClient();

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

root.render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <SettingsProvider>
        <RouterProvider router={router} />
      </SettingsProvider>
    </QueryClientProvider>
  </React.StrictMode>,
);
